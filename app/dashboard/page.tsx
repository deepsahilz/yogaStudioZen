"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Layers, ClipboardCheck } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DashboardData {
  totalStudents: number;
  totalTrainers: number;
  totalBatches: number;
  totalAttendance: number;
}

const cards = [
  { key: "totalStudents" as const, label: "Total Students", icon: Users, color: "text-chart-1" },
  { key: "totalTrainers" as const, label: "Total Trainers", icon: UserCheck, color: "text-chart-2" },
  { key: "totalBatches" as const, label: "Total Batches", icon: Layers, color: "text-chart-3" },
  { key: "totalAttendance" as const, label: "Attendance Records", icon: ClipboardCheck, color: "text-chart-4" },
];

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardData>("/api/dashboard", fetcher);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl text-balance">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your yoga studio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between md:pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{data?.[card.key] ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
