import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const batches = await sql`
    SELECT b.*, t.name as trainer_name
    FROM batches b
    LEFT JOIN trainers t ON b.trainer_id = t.id
    ORDER BY b.created_at DESC
  `;
  return NextResponse.json(batches);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { name, trainer_id, batch_time } = await request.json();
  if (!name || !batch_time) {
    return NextResponse.json({ error: "Name and batch time are required" }, { status: 400 });
  }
  const rows = await sql`
    INSERT INTO batches (name, trainer_id, batch_time)
    VALUES (${name}, ${trainer_id || null}, ${batch_time})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id, name, trainer_id, batch_time } = await request.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const rows = await sql`
    UPDATE batches SET name = ${name}, trainer_id = ${trainer_id || null}, batch_time = ${batch_time}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id } = await request.json();
  await sql`DELETE FROM batches WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
