import { NextRequest, NextResponse } from "next/server";

interface GoogleJwtPayload {
  iss?: string;
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  exp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential || typeof credential !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid Google credential token" },
        { status: 400 }
      );
    }

    // Decode JWT payload (standard Base64URL decoding)
    const parts = credential.split(".");
    if (parts.length !== 3) {
      return NextResponse.json(
        { success: false, error: "Malformed JWT token" },
        { status: 400 }
      );
    }

    const payloadRaw = Buffer.from(parts[1], "base64url").toString("utf-8");
    const payload: GoogleJwtPayload = JSON.parse(payloadRaw);

    // Defensive validation of claims
    const expectedClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      return NextResponse.json(
        { success: false, error: "Token audience does not match configured Google Client ID" },
        { status: 401 }
      );
    }

    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!payload.iss || !validIssuers.includes(payload.iss)) {
      return NextResponse.json(
        { success: false, error: "Invalid token issuer" },
        { status: 401 }
      );
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSeconds) {
      return NextResponse.json(
        { success: false, error: "Google token has expired" },
        { status: 401 }
      );
    }

    const user = {
      id: payload.sub ?? `user-${Date.now()}`,
      name: payload.name ?? "Comensal Anónimo",
      email: payload.email ?? "",
      picture: payload.picture,
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error verifying token";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
