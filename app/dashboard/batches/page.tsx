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
import { Plus, Pencil, Trash2, Sun, Moon } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Batch {
  id: number;
  name: string;
  trainer_id: number | null;
  trainer_name: string | null;
  batch_time: string;
}

interface Trainer {
  id: number;
  name: string;
}

const emptyForm = { name: "", trainer_id: "", batch_time: "" };

export default function BatchesPage() {
  const { data: batches, isLoading, mutate } = useSWR<Batch[]>("/api/batches", fetcher);
  const { data: trainers } = useSWR<Trainer[]>("/api/trainers", fetcher);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(batch: Batch) {
    setEditingId(batch.id);
    setForm({
      name: batch.name,
      trainer_id: batch.trainer_id ? String(batch.trainer_id) : "",
      batch_time: batch.batch_time,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      trainer_id: form.trainer_id ? Number(form.trainer_id) : null,
      ...(editingId ? { id: editingId } : {}),
    };

    await fetch("/api/batches", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setDialogOpen(false);
    setSaving(false);
    mutate();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    await fetch("/api/batches", {
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Batches</h1>
          <p className="mt-1 text-muted-foreground">Manage your yoga class batches</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : batches && batches.length > 0 ? (
              batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium text-foreground">{batch.name}</TableCell>
                  <TableCell>{batch.trainer_name || <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      {batch.batch_time === "morning" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                      {batch.batch_time === "morning" ? "Morning" : "Evening"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(batch)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No batches found. Create your first batch.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Batch" : "Add Batch"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Batch Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Beginners Morning Batch" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Trainer</Label>
              <Select value={form.trainer_id} onValueChange={(v) => setForm({ ...form, trainer_id: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select trainer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {trainers?.map((trainer) => (
                    <SelectItem key={trainer.id} value={String(trainer.id)}>{trainer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Batch Time</Label>
              <Select value={form.batch_time} onValueChange={(v) => setForm({ ...form, batch_time: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.batch_time}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
