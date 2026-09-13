"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";

export interface InvisibleCaptchaRef {
  getVerificationData: () => {
    antiBotToken: string;
    honeypot: string;
    turnstileToken?: string;
  };
  refresh: () => Promise<void>;
}

interface InvisibleCaptchaProps {
  onReady?: (ready: boolean) => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          appearance?: "always" | "execute" | "interaction-only";
          size?: "normal" | "compact" | "invisible";
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export const InvisibleCaptcha = forwardRef<InvisibleCaptchaRef, InvisibleCaptchaProps>(
  ({ onReady }, ref) => {
    const [antiBotToken, setAntiBotToken] = useState<string>("");
    const [honeypot, setHoneypot] = useState<string>("");
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const turnstileContainerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

    const fetchToken = React.useCallback(async () => {
      try {
        const res = await fetch("/api/security/anti-bot-token");
        if (res.ok) {
          const data = await res.json();
          setAntiBotToken(data.token);
          if (onReady) onReady(true);
        }
      } catch (err) {
        console.error("Error obteniendo token anti-bot:", err);
      }
    }, [onReady]);

    useEffect(() => {
      fetchToken();

      // Si Cloudflare Turnstile está configurado, inicializarlo
      if (siteKey && typeof window !== "undefined") {
        const scriptId = "cf-turnstile-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        const initTurnstile = () => {
          if (window.turnstile && turnstileContainerRef.current && !widgetIdRef.current) {
            try {
              widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
                sitekey: siteKey,
                appearance: "interaction-only",
                size: "invisible",
                callback: (token: string) => {
                  setTurnstileToken(token);
                },
                "expired-callback": () => {
                  setTurnstileToken("");
                },
              });
            } catch (e) {
              console.error("Turnstile render error:", e);
            }
          }
        };

        if (!script) {
          script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          script.async = true;
          script.defer = true;
          script.onload = initTurnstile;
          document.head.appendChild(script);
        } else if (window.turnstile) {
          initTurnstile();
        }
      }
    }, [siteKey, fetchToken]);

    useImperativeHandle(ref, () => ({
      getVerificationData: () => ({
        antiBotToken,
        honeypot,
        turnstileToken: turnstileToken || undefined,
      }),
      refresh: async () => {
        await fetchToken();
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    return (
      <div aria-hidden="true" style={{ display: "none" }}>
        {/* Honeypot trap: los bots rellenan los campos ocultos automáticamente */}
        <input
          type="text"
          name="website_hp"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{
            opacity: 0,
            position: "absolute",
            top: 0,
            left: 0,
            height: 0,
            width: 0,
            zIndex: -1,
            pointerEvents: "none",
          }}
        />

        {/* Contenedor para Turnstile Invisible */}
        {siteKey && <div ref={turnstileContainerRef} />}
      </div>
    );
  }
);

InvisibleCaptcha.displayName = "InvisibleCaptcha";
