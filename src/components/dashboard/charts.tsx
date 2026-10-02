"use client";
import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, Pie, PieChart, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TrendPoint { label: string; monthly: number; cumulative: number }
export interface Slice { name: string; value: number; color: string }
export interface Bar1 { name: string; value: number }

const tick = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
const tip = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--foreground))",
  },
  cursor: { fill: "hsl(var(--muted))", opacity: 0.5 },
};

function Empty({ text }: { text: string }) {
  return <div className="grid h-full place-items-center text-sm text-muted-foreground">{text}</div>;
}

export function DashboardCharts({ trend, status, municipality }: { trend: TrendPoint[]; status: Slice[]; municipality: Bar1[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader><CardTitle>Accomplishments completed over time</CardTitle></CardHeader>
        <CardContent className="h-72">
          {trend.length === 0 ? <Empty text="No accomplishments with a completion date yet." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="monthly" name="Completed in month" fill="#2f6fa3" radius={[3, 3, 0, 0]} maxBarSize={36} />
                <Line dataKey="cumulative" name="Running total" stroke="#e0a100" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader><CardTitle>Contracts by status</CardTitle></CardHeader>
        <CardContent className="h-72">
          {status.length === 0 ? <Empty text="No contracts yet." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={status} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="hsl(var(--card))">
                  {status.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-5">
        <CardHeader><CardTitle>Contracts by municipality</CardTitle></CardHeader>
        <CardContent style={{ height: Math.max(160, municipality.length * 44 + 40) }}>
          {municipality.length === 0 ? <Empty text="No contracts yet." /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={municipality} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={tick} tickLine={false} axisLine={false} />
                <Tooltip {...tip} />
                <Bar dataKey="value" name="Contracts" fill="#2f6fa3" radius={[0, 3, 3, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
