import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const schedules = await sql`
    SELECT s.*, b.name as batch_name, b.batch_time
    FROM schedules s
    JOIN batches b ON s.batch_id = b.id
    ORDER BY
      CASE s.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END,
      b.name
  `;
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { batch_id, day_of_week, yoga_type } = await request.json();
  if (!batch_id || !day_of_week || !yoga_type) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  const rows = await sql`
    INSERT INTO schedules (batch_id, day_of_week, yoga_type)
    VALUES (${batch_id}, ${day_of_week}, ${yoga_type})
    ON CONFLICT (batch_id, day_of_week)
    DO UPDATE SET yoga_type = ${yoga_type}
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const { id } = await request.json();
  await sql`DELETE FROM schedules WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
