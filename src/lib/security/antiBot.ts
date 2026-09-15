import crypto from "node:crypto";
import { getSessionSecret } from "@/lib/auth/session";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";

export interface AntiBotVerificationParams {
  token?: string | null;
  honeypot?: string | null;
  turnstileToken?: string | null;
  clientIp?: string;
  minSeconds?: number;
  maxHours?: number;
}

export interface AntiBotResult {
  valid: boolean;
  reason?: string;
}

/**
 * Genera un token firmado con timestamp para el Time-trap anti-bot.
 */
export function generateAntiBotToken(): string {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString("hex");
  const payload = `${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  return `${payload}:${signature}`;
}

/**
 * Valida de forma completa la defensa anti-bots:
 * 1. Comprueba honeypot (debe estar completamente vacío).
 * 2. Si hay Turnstile configurado, valida obligatoriamente contra Cloudflare.
 * 3. Valida la firma del token y la ventana de tiempo humana (1.2s <= tiempo <= 2h).
 */
export async function verifyAntiBot(params: AntiBotVerificationParams): Promise<AntiBotResult> {
  const {
    token,
    honeypot,
    turnstileToken,
    clientIp,
    minSeconds = 1.2,
    maxHours = 2,
  } = params;

  // 1. Detección de Honeypot: si el bot llenó el campo trampa, bloquear
  if (honeypot && String(honeypot).trim().length > 0) {
    return { valid: false, reason: "Detección de actividad automatizada (honeypot)." };
  }

  // 2. Si Cloudflare Turnstile está configurado con secret key en el servidor
  if (TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return { valid: false, reason: "Verificación de seguridad Turnstile requerida." };
    }

    try {
      const formData = new URLSearchParams();
      formData.append("secret", TURNSTILE_SECRET_KEY);
      formData.append("response", turnstileToken);
      if (clientIp) formData.append("remoteip", clientIp);

      const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      });

      const cfData = await cfRes.json();
      if (cfData.success) {
        return { valid: true };
      }
      return { valid: false, reason: "Verificación de seguridad Turnstile inválida." };
    } catch (err) {
      console.error("Error validando Cloudflare Turnstile:", err);
      return { valid: false, reason: "Error al validar la verificación de seguridad." };
    }
  }

  // 3. Validación de Time-trap criptográfico
  if (!token) {
    return { valid: false, reason: "Falta token de verificación de seguridad." };
  }

  const parts = token.split(":");
  if (parts.length !== 3) {
    return { valid: false, reason: "Token de seguridad con formato inválido." };
  }

  const [timestampStr, nonce, receivedSig] = parts;
  const payload = `${timestampStr}:${nonce}`;
  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  // Comparación segura en tiempo constante
  try {
    const isSigValid = crypto.timingSafeEqual(
      Buffer.from(receivedSig, "hex"),
      Buffer.from(expectedSig, "hex")
    );
    if (!isSigValid) {
      return { valid: false, reason: "Firma de seguridad inválida." };
    }
  } catch {
    return { valid: false, reason: "Error de verificación de firma de seguridad." };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, reason: "Timestamp inválido." };
  }

  const now = Date.now();
  const elapsedMs = now - timestamp;

  // Si el envío se realizó en menos de minSeconds (imposible para un humano)
  if (elapsedMs < minSeconds * 1000) {
    return { valid: false, reason: "Envío demasiado rápido (detección de bot)." };
  }

  // Si el token tiene más de maxHours (ataque de repetición o sesión expirada)
  if (elapsedMs > maxHours * 60 * 60 * 1000) {
    return { valid: false, reason: "El token de seguridad ha expirado. Por favor, reintenta." };
  }

  return { valid: true };
}
