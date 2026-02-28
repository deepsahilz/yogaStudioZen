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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Schedule {
  id: number;
  batch_id: number;
  batch_name: string;
  batch_time: string;
  day_of_week: string;
  yoga_type: string;
}

interface Batch {
  id: number;
  name: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyForm = { batch_id: "", day_of_week: "", yoga_type: "" };

export default function SchedulesPage() {
  const { data: schedules, isLoading, mutate } = useSWR<Schedule[]>("/api/schedules", fetcher);
  const { data: batches } = useSWR<Batch[]>("/api/batches", fetcher);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch_id: Number(form.batch_id),
        day_of_week: form.day_of_week,
        yoga_type: form.yoga_type,
      }),
    });
    setDialogOpen(false);
    setSaving(false);
    mutate();
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this schedule entry?")) return;
    await fetch("/api/schedules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutate();
  }

  // Group schedules by day for the table view
  const schedulesByDay: Record<string, Schedule[]> = {};
  DAYS.forEach((day) => { schedulesByDay[day] = []; });
  schedules?.forEach((s) => {
    if (schedulesByDay[s.day_of_week]) {
      schedulesByDay[s.day_of_week].push(s);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Weekly Schedule</h1>
          <p className="mt-1 text-muted-foreground">Manage the yoga class schedule</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Day</TableHead>
                    <TableHead>Classes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DAYS.map((day) => (
                    <TableRow key={day}>
                      <TableCell className="font-medium text-foreground align-top">{day}</TableCell>
                      <TableCell>
                        {schedulesByDay[day].length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {schedulesByDay[day].map((s) => (
                              <div key={s.id} className="flex items-center gap-2">
                                <Badge variant="secondary">{s.batch_name}</Badge>
                                <span className="text-sm text-foreground">{s.yoga_type}</span>
                                <Badge variant="outline" className="text-xs">{s.batch_time}</Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleDelete(s.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No classes scheduled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule Entry</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Batch</Label>
              <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>{batch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Day of Week</Label>
              <Select value={form.day_of_week} onValueChange={(v) => setForm({ ...form, day_of_week: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="yoga_type">Yoga Type</Label>
              <Input id="yoga_type" value={form.yoga_type} onChange={(e) => setForm({ ...form, yoga_type: e.target.value })} placeholder="e.g. Hatha, Vinyasa, Ashtanga" required />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.batch_id || !form.day_of_week || !form.yoga_type}>
              {saving ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
