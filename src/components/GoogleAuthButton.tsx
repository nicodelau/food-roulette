"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface GoogleAuthButtonProps {
  user: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  user,
  onLoginSuccess,
  onLogout,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    // Load Google Identity Services script if not already present
    const loadScript = () => {
      if (document.getElementById("google-gsi-script")) {
        initGoogle();
        return;
      }

      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      document.body.appendChild(script);
    };

    const handleCredentialResponse = async (response: any) => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          onLoginSuccess(data.user);
        } else {
          alert(data.error || "No se pudo iniciar sesión con Google");
        }
      } catch {
        alert("Error de red al conectar con Google");
      } finally {
        setIsLoading(false);
      }
    };

    const initGoogle = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "medium",
        shape: "pill",
        text: "signin_with",
        locale: "es",
      });
    };

    loadScript();
  }, [user, onLoginSuccess]);

  if (user) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 py-1 pl-1.5 pr-2.5 shadow-sm">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="h-6 w-6 rounded-full border border-orange-500/50 object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
            <UserIcon className="h-3.5 w-3.5" />
          </div>
        )}
        <span className="hidden max-w-[90px] truncate text-xs font-medium text-slate-200 sm:inline">
          {user.name.split(" ")[0]}
        </span>
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="ml-1 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={buttonRef} className="min-h-[32px]" />
      {isLoading && (
        <span className="text-[11px] text-orange-400 animate-pulse block">
          Iniciando sesión...
        </span>
      )}
    </div>
  );
};
