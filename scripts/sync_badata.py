#!/usr/bin/env python3
"""
Sync Script for Buenos Aires Open Data (BA Data)
Fetches official gastronomic and cultural spaces from the GCBA Open Data portal,
normalizes them into PlaceRaw format, and saves a local snapshot to src/data/ba_data_gastronomia.json.
"""

import sys
import os
import io
import csv
import json
import re
import urllib.request

BA_DATA_URL = (
    "https://data.buenosaires.gob.ar/dataset/espacios-culturales/resource/"
    "juqdkmgo-711-resource/download"
)
OUTPUT_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "src",
    "data",
    "ba_data_gastronomia.json",
)


def fetch_and_clean_data(source_file=None):
    if source_file and os.path.exists(source_file):
        print(f"Loading GCBA dataset from local file {source_file}...")
        with open(source_file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    else:
        print(f"Fetching GCBA dataset from {BA_DATA_URL}...")
        import subprocess

        try:
            res = subprocess.run(
                ["curl", "-s", "-L", "-A", "Mozilla/5.0 (X11; Linux x86_64)", BA_DATA_URL],
                capture_output=True,
                text=True,
                check=True,
            )
            content = res.stdout
        except Exception as e:
            print(f"Warning: curl failed ({e}), falling back to urllib...")
            req = urllib.request.Request(
                BA_DATA_URL,
                headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read().decode("utf-8", errors="ignore")

    reader = csv.DictReader(io.StringIO(content))
    places = []

    for row in reader:
        name = (row.get("ESTABLECIMIENTO") or "").strip()
        fp = (row.get("FUNCION_PRINCIPAL") or "").strip().upper()
        sub = (row.get("SUBCATEGORIA") or "").strip().upper()
        lat_str = (row.get("LATITUD") or "").strip()
        lng_str = (row.get("LONGITUD") or "").strip()
        comuna_str = (row.get("COMUNA") or "").strip().upper()
        barrio = (row.get("BARRIO") or "").strip()
        address = (row.get("DIRECCION") or "").strip()
        fid = (row.get("fid") or "").strip()

        # Filter gastronomic relevant venues
        is_bar_or_cafe = (
            fp in ["BAR", "CLUB DE MUSICA EN VIVO", "CENTRO CULTURAL"]
            or "BAR" in sub
            or "CAFE" in sub
            or "CONFITERIA" in sub
        )
        if not is_bar_or_cafe or not name:
            continue

        try:
            lat = float(lat_str)
            lng = float(lng_str)
        except (ValueError, TypeError):
            continue

        # Strict CABA coordinate bounds check
        if not (-34.75 < lat < -34.5 and -58.55 < lng < -58.35):
            continue

        # Determine Comuna (1 to 15)
        comuna_match = re.search(r"(\d+)", comuna_str)
        if comuna_match:
            comuna_num = int(comuna_match.group(1))
            zone_id = f"caba-{comuna_num}"
        else:
            continue

        # Build address
        full_address = address
        if not full_address:
            calle = (row.get("CALLE") or "").strip()
            altura = (row.get("ALTURA") or "").strip()
            if calle and altura:
                full_address = f"{calle} {altura}, {barrio}"
            else:
                full_address = f"{name}, {barrio}, Buenos Aires"

        # Detect Bares Notables and tags
        is_notable = "NOTABLE" in sub or "NOTABLE" in fp
        tags = {
            "amenity": "bar" if "BAR" in fp else "cafe",
            "barrio": barrio,
            "comuna": str(comuna_num),
        }

        if is_notable:
            tags["heritage"] = "bar_notable"
            tags["cuisine"] = "argentinian;cafe;traditional;porteña"
            rating = 4.7
            price_level = 2
        else:
            tags["cuisine"] = "argentinian;bar_food;drinks;cafe"
            rating = 4.4
            price_level = 1 if "CONFITERIA" in sub or "CAFE" in sub else 2

        web = (row.get("WEB") or "").strip()
        if web:
            tags["contact:website"] = web

        phone = (row.get("TELEFONO") or "").strip()
        if phone:
            tags["contact:phone"] = phone

        place = {
            "externalId": f"badata-{fid}",
            "name": name.title() if name.isupper() else name,
            "location": {"lat": lat, "lng": lng},
            "address": full_address,
            "zoneId": zone_id,
            "tags": tags,
            "rating": rating,
            "priceLevel": price_level,
        }
        places.append(place)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    print(f"Successfully processed {len(places)} places from BA Data into {OUTPUT_FILE}!")
    return len(places)


if __name__ == "__main__":
    src_file = sys.argv[1] if len(sys.argv) > 1 else ("/tmp/espacios_culturales.csv" if os.path.exists("/tmp/espacios_culturales.csv") else None)
    fetch_and_clean_data(src_file)
