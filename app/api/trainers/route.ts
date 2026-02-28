import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const trainers = await sql`SELECT * FROM trainers ORDER BY created_at DESC`;
  return NextResponse.json(trainers);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { name, specialization, contact, experience } = await request.json();
  if (!name || !specialization || !contact || experience === undefined) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const rows = await sql`
    INSERT INTO trainers (name, specialization, contact, experience)
    VALUES (${name}, ${specialization}, ${contact}, ${experience})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id, name, specialization, contact, experience } = await request.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const rows = await sql`
    UPDATE trainers SET name = ${name}, specialization = ${specialization},
    contact = ${contact}, experience = ${experience}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id } = await request.json();
  await sql`DELETE FROM trainers WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
