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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Student {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  batch_id: number | null;
  batch_name: string | null;
}

interface Batch {
  id: number;
  name: string;
}

const emptyForm = { name: "", age: "", gender: "", contact: "", address: "", batch_id: "" };

export default function StudentsPage() {
  const { data: students, isLoading, mutate } = useSWR<Student[]>("/api/students", fetcher);
  const { data: batches } = useSWR<Batch[]>("/api/batches", fetcher);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      name: student.name,
      age: String(student.age),
      gender: student.gender,
      contact: student.contact,
      address: student.address,
      batch_id: student.batch_id ? String(student.batch_id) : "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      age: Number(form.age),
      batch_id: form.batch_id ? Number(form.batch_id) : null,
      ...(editingId ? { id: editingId } : {}),
    };

    await fetch("/api/students", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setDialogOpen(false);
    setSaving(false);
    mutate();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await fetch("/api/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Students</h1>
          <p className="mt-1 text-muted-foreground">Manage your yoga students</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : students && students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.gender}</Badge>
                  </TableCell>
                  <TableCell>{student.contact}</TableCell>
                  <TableCell>{student.batch_name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No students found. Add your first student.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Batch</Label>
              <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select batch (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>{batch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.age || !form.gender || !form.contact || !form.address}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
