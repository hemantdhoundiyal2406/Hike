import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth-schema";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { seedDefaultContent } from "@/lib/content";
import { hashPassword, verifyPassword } from "@/lib/password";
import Admin from "@/models/Admin";
import { apiError } from "@/lib/admin-api";
export async function POST(request) {
    try {
        const credentials = loginSchema.parse(await request.json());
        const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const configuredPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME?.trim() || "NovaForge Admin";
        if (!configuredEmail || !configuredPassword) {
            return NextResponse.json({
                success: false,
                message: "Admin credentials are not configured in .env.local.",
            }, { status: 503 });
        }
        if (credentials.email.toLowerCase() !== configuredEmail) {
            return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
        }
        if (credentials.password !== configuredPassword) {
            return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
        }
        try {
            await connectToDatabase();
            let admin = await Admin.findOne({ email: configuredEmail });
            if (!admin) {
                admin = await Admin.create({
                    name: adminName,
                    email: configuredEmail,
                    passwordHash: hashPassword(configuredPassword),
                });
            }
            else if (!verifyPassword(credentials.password, admin.passwordHash)) {
                return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
            }
            admin.lastLoginAt = new Date();
            await admin.save();
            await seedDefaultContent();
            const response = NextResponse.json({
                success: true,
                message: "Welcome back.",
            });
            setSessionCookie(response, createSessionToken({
                adminId: admin._id.toString(),
                email: admin.email,
                name: admin.name,
            }));
            return response;
        }
        catch {
            const response = NextResponse.json({
                success: true,
                message: "Welcome back.",
            });
            setSessionCookie(response, createSessionToken({
                adminId: "local-admin",
                email: configuredEmail,
                name: adminName,
            }));
            return response;
        }
    }
    catch (error) {
        return apiError(error, "Unable to sign in right now.");
    }
}
