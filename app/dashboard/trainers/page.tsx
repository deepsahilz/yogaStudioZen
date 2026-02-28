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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Trainer {
  id: number;
  name: string;
  specialization: string;
  contact: string;
  experience: number;
}

const emptyForm = { name: "", specialization: "", contact: "", experience: "" };

export default function TrainersPage() {
  const { data: trainers, isLoading, mutate } = useSWR<Trainer[]>("/api/trainers", fetcher);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(trainer: Trainer) {
    setEditingId(trainer.id);
    setForm({
      name: trainer.name,
      specialization: trainer.specialization,
      contact: trainer.contact,
      experience: String(trainer.experience),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      experience: Number(form.experience),
      ...(editingId ? { id: editingId } : {}),
    };

    await fetch("/api/trainers", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setDialogOpen(false);
    setSaving(false);
    mutate();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    await fetch("/api/trainers", {
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Trainers</h1>
          <p className="mt-1 text-muted-foreground">Manage your yoga trainers</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : trainers && trainers.length > 0 ? (
              trainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell className="font-medium text-foreground">{trainer.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trainer.specialization}</Badge>
                  </TableCell>
                  <TableCell>{trainer.contact}</TableCell>
                  <TableCell>{trainer.experience} {trainer.experience === 1 ? "year" : "years"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(trainer)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(trainer.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No trainers found. Add your first trainer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Trainer" : "Add Trainer"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Hatha Yoga, Vinyasa" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact">Contact</Label>
                <Input id="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input id="experience" type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.specialization || !form.contact || !form.experience}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
