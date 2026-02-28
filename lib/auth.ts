import { cookies } from "next/headers";

const SESSION_COOKIE = "yoga_admin_session";

export async function setSession(userId: number, name: string, email: string) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({ userId, name, email });
  const encoded = Buffer.from(sessionData).toString("base64");
  cookieStore.set(SESSION_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;
  try {
    const decoded = Buffer.from(cookie.value, "base64").toString("utf-8");
    return JSON.parse(decoded) as { userId: number; name: string; email: string };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
