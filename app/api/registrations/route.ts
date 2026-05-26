import { NextRequest, NextResponse } from "next/server";
import { getAllSignups, getSignupCount } from "@/lib/db";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  const expectedKey = process.env.ADMIN_KEY || "humanify-admin-2026";

  if (adminKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [signups, total] = await Promise.all([getAllSignups(), getSignupCount()]);
    return NextResponse.json({ signups, total });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Registrations error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
