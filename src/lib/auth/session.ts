import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "karmax_session";
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION: SESSION_SECRET must be defined with at least 32 characters in production."
      );
    }
    console.warn(
      "[Security Warning] SESSION_SECRET is not set or has less than 32 characters. Set a secure SESSION_SECRET in .env.local."
    );
    return secret || "karmax-dev-only-ephemeral-secret-key-at-least-32-chars";
  }
  return secret;
}

export { getSessionSecret };

interface SessionPayload {
  userId: number;
  email: string;
  roleId: number;
  exp: number;
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = JSON.stringify({ ...payload, exp });
  const base64Data = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(base64Data)
    .digest("base64url");

  return `${base64Data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSessionSecret())
      .update(base64Data)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature, "base64url");
    const expectedSigBuffer = Buffer.from(expectedSig, "base64url");

    if (
      sigBuffer.length !== expectedSigBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)
    ) {
      return null;
    }

    const data: SessionPayload = JSON.parse(
      Buffer.from(base64Data, "base64url").toString("utf8")
    );

    if (Date.now() > data.exp) return null;

    return data;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: { id: number; email: string; roleId: number }) {
  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}
