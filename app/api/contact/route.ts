import { NextRequest, NextResponse } from "next/server";
import { insertContact } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await insertContact(name.trim(), email.toLowerCase().trim(), message.trim());
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Contact error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
