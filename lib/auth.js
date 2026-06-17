import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
export const ADMIN_SESSION_COOKIE = "novaforge_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
function getSessionSecret() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error("SESSION_SECRET must contain at least 32 characters.");
    }
    return secret;
}
function sign(value) {
    return createHmac("sha256", getSessionSecret())
        .update(value)
        .digest("base64url");
}
export function createSessionToken(admin) {
    const payload = {
        ...admin,
        expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encoded}.${sign(encoded)}`;
}
export function verifySessionToken(token) {
    if (!token)
        return null;
    try {
        const [encoded, signature] = token.split(".");
        if (!encoded || !signature)
            return null;
        const expected = Buffer.from(sign(encoded));
        const received = Buffer.from(signature);
        if (expected.length !== received.length ||
            !timingSafeEqual(expected, received)) {
            return null;
        }
        const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
        if (!session.adminId || session.expiresAt <= Math.floor(Date.now() / 1000)) {
            return null;
        }
        return session;
    }
    catch {
        return null;
    }
}
export function setSessionCookie(response, token) {
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
    });
}
export function clearSessionCookie(response) {
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}
export function getRequestSession(request) {
    return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
export async function getAdminSession() {
    const cookieStore = await cookies();
    return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}
