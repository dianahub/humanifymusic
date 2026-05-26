import { NextRequest, NextResponse } from "next/server";
import { insertSignup } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, language } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await insertSignup(name ?? null, email.toLowerCase().trim(), language ?? "en");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already exists")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    console.error("Register error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
