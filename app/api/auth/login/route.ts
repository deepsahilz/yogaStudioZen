import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSQL } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const sql = getSQL();
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const rows = await sql`SELECT * FROM admin_users WHERE email = ${email}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setSession(user.id, user.name, user.email);
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
