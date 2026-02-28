"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ClipboardCheck, Layers } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StudentReport {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  batch_name: string | null;
}

interface AttendanceReport {
  student_name: string;
  batch_name: string;
  status: string;
}

interface BatchStudentCount {
  id: number;
  batch_name: string;
  batch_time: string;
  student_count: number;
}

export default function ReportsPage() {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: students, isLoading: loadingStudents } = useSWR<StudentReport[]>(
    "/api/reports?type=students",
    fetcher
  );

  const { data: attendanceRecords, isLoading: loadingAttendance } = useSWR<AttendanceReport[]>(
    attendanceDate ? `/api/reports?type=attendance&date=${attendanceDate}` : null,
    fetcher
  );

  const { data: batchCounts, isLoading: loadingBatches } = useSWR<BatchStudentCount[]>(
    "/api/reports?type=batch-students",
    fetcher
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Reports</h1>
        <p className="mt-1 text-muted-foreground">View summaries and reports for your studio</p>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Student List
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="batches" className="gap-2">
            <Layers className="h-4 w-4" />
            Batch Count
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student List Report</CardTitle>
              <CardDescription>Complete list of all registered students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Batch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStudents ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : students && students.length > 0 ? (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                          <TableCell>{student.age}</TableCell>
                          <TableCell><Badge variant="secondary">{student.gender}</Badge></TableCell>
                          <TableCell>{student.contact}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{student.address}</TableCell>
                          <TableCell>{student.batch_name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No students found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {students && students.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">Total students: {students.length}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Report by Date</CardTitle>
              <CardDescription>View attendance records for a specific date</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="max-w-xs">
                <Label htmlFor="report-date">Select Date</Label>
                <Input id="report-date" type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="mt-2" />
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAttendance ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 3 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : attendanceRecords && attendanceRecords.length > 0 ? (
                      attendanceRecords.map((record, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-foreground">{record.student_name}</TableCell>
                          <TableCell>{record.batch_name}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === "present" ? "default" : "secondary"}>
                              {record.status === "present" ? "Present" : "Absent"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No attendance records for this date.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {attendanceRecords && attendanceRecords.length > 0 && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total: {attendanceRecords.length}</span>
                  <span>Present: {attendanceRecords.filter((r) => r.status === "present").length}</span>
                  <span>Absent: {attendanceRecords.filter((r) => r.status === "absent").length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch-wise Student Count</CardTitle>
              <CardDescription>Number of students enrolled in each batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Batch Time</TableHead>
                      <TableHead className="text-right">Student Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBatches ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 3 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : batchCounts && batchCounts.length > 0 ? (
                      batchCounts.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium text-foreground">{batch.batch_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {batch.batch_time === "morning" ? "Morning" : "Evening"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">{batch.student_count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No batches found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {batchCounts && batchCounts.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Total across all batches: {batchCounts.reduce((sum, b) => sum + Number(b.student_count), 0)} students
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
