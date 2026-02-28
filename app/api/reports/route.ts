import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "students") {
    const students = await sql`
      SELECT s.id, s.name, s.age, s.gender, s.contact, s.address, b.name as batch_name
      FROM students s
      LEFT JOIN batches b ON s.batch_id = b.id
      ORDER BY s.name
    `;
    return NextResponse.json(students);
  }

  if (type === "attendance") {
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    const records = await sql`
      SELECT a.status, s.name as student_name, b.name as batch_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE a.date = ${date}
      ORDER BY b.name, s.name
    `;
    return NextResponse.json(records);
  }

  if (type === "batch-students") {
    const counts = await sql`
      SELECT b.id, b.name as batch_name, b.batch_time, COUNT(s.id) as student_count
      FROM batches b
      LEFT JOIN students s ON s.batch_id = b.id
      GROUP BY b.id, b.name, b.batch_time
      ORDER BY b.name
    `;
    return NextResponse.json(counts);
  }

  return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
}
