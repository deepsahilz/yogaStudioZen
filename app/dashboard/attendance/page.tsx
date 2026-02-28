"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Batch {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
}

interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  batch_name: string;
  date: string;
  status: string;
}

export default function AttendancePage() {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: batches } = useSWR<Batch[]>("/api/batches", fetcher);
  const { data: batchStudents } = useSWR<Student[]>(
    selectedBatch ? `/api/attendance?batch_id=${selectedBatch}` : null,
    fetcher
  );
  const { data: dateRecords, isLoading: loadingRecords } = useSWR<AttendanceRecord[]>(
    viewDate ? `/api/attendance?date=${viewDate}` : null,
    fetcher
  );

  function toggleAttendance(studentId: number) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  }

  async function handleSaveAttendance() {
    if (!selectedBatch || !date || !batchStudents?.length) return;
    setSaving(true);
    setSaved(false);

    const records = batchStudents.map((student) => ({
      student_id: student.id,
      batch_id: Number(selectedBatch),
      date,
      status: attendance[student.id] || "absent",
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Attendance</h1>
        <p className="mt-1 text-muted-foreground">Mark and view student attendance</p>
      </div>

      <Tabs defaultValue="mark">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="view">View by Date</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mark Daily Attendance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Select Batch</Label>
                  <Select value={selectedBatch} onValueChange={(v) => { setSelectedBatch(v); setAttendance({}); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={String(batch.id)}>{batch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="att-date">Date</Label>
                  <Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              {batchStudents && batchStudents.length > 0 ? (
                <>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchStudents.map((student) => {
                          const status = attendance[student.id] || "absent";
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  variant={status === "present" ? "default" : "outline"}
                                  onClick={() => toggleAttendance(student.id)}
                                  className="gap-1"
                                >
                                  {status === "present" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                  {status === "present" ? "Present" : "Absent"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleSaveAttendance} disabled={saving}>
                      {saving ? "Saving..." : "Save Attendance"}
                    </Button>
                    {saved && <span className="text-sm text-primary font-medium">Attendance saved successfully!</span>}
                  </div>
                </>
              ) : selectedBatch ? (
                <p className="text-muted-foreground text-sm">No students found in this batch.</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Date</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="max-w-xs">
                <Label htmlFor="view-date">Select Date</Label>
                <Input id="view-date" type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="mt-2" />
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
                    {loadingRecords ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 3 }).map((_, j) => (
                            <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : dateRecords && dateRecords.length > 0 ? (
                      dateRecords.map((record) => (
                        <TableRow key={record.id}>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
