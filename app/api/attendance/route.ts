import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const student_id = searchParams.get("student_id");
  const batch_id = searchParams.get("batch_id");

  if (student_id) {
    const records = await sql`
      SELECT a.*, s.name as student_name, b.name as batch_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE a.student_id = ${student_id}
      ORDER BY a.date DESC
    `;
    return NextResponse.json(records);
  }

  if (date) {
    const records = await sql`
      SELECT a.*, s.name as student_name, b.name as batch_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE a.date = ${date}
      ORDER BY s.name
    `;
    return NextResponse.json(records);
  }

  if (batch_id) {
    const students = await sql`
      SELECT s.id, s.name FROM students s
      WHERE s.batch_id = ${batch_id}
      ORDER BY s.name
    `;
    return NextResponse.json(students);
  }

  const records = await sql`
    SELECT a.*, s.name as student_name, b.name as batch_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    LEFT JOIN batches b ON a.batch_id = b.id
    ORDER BY a.date DESC, s.name
    LIMIT 100
  `;
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { records } = await request.json();
  if (!records || !Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "Attendance records are required" }, { status: 400 });
  }

  for (const record of records) {
    await sql`
      INSERT INTO attendance (student_id, batch_id, date, status)
      VALUES (${record.student_id}, ${record.batch_id}, ${record.date}, ${record.status})
      ON CONFLICT (student_id, date)
      DO UPDATE SET status = ${record.status}
    `;
  }

  return NextResponse.json({ success: true, count: records.length }, { status: 201 });
}
