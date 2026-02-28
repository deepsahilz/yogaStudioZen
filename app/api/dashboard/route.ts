import { NextResponse } from "next/server";
import { getSQL } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSQL();
  const [students, trainers, batches, attendance] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM students`,
    sql`SELECT COUNT(*) as count FROM trainers`,
    sql`SELECT COUNT(*) as count FROM batches`,
    sql`SELECT COUNT(*) as count FROM attendance`,
  ]);

  return NextResponse.json({
    totalStudents: Number(students[0].count),
    totalTrainers: Number(trainers[0].count),
    totalBatches: Number(batches[0].count),
    totalAttendance: Number(attendance[0].count),
  });
}
