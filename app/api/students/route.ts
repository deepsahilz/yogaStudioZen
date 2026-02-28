import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const students = await sql`
    SELECT s.*, b.name as batch_name
    FROM students s
    LEFT JOIN batches b ON s.batch_id = b.id
    ORDER BY s.created_at DESC
  `;
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { name, age, gender, contact, address, batch_id } = await request.json();
  if (!name || !age || !gender || !contact || !address) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const rows = await sql`
    INSERT INTO students (name, age, gender, contact, address, batch_id)
    VALUES (${name}, ${age}, ${gender}, ${contact}, ${address}, ${batch_id || null})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id, name, age, gender, contact, address, batch_id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const rows = await sql`
    UPDATE students SET name = ${name}, age = ${age}, gender = ${gender},
    contact = ${contact}, address = ${address}, batch_id = ${batch_id || null}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id } = await request.json();
  await sql`DELETE FROM students WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
