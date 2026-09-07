import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/libra/app-shell";
import { Card, CardHeader, StatCard } from "@/components/libra/ui";
import {
  channelSplit,
  dashboardStats,
  facultyUsage,
  hourlyCheckIns,
  weeklyVisits,
} from "@/lib/libra/mock-data";

export const Route = createFileRoute("/librarian/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — LibraPass" },
      { name: "description", content: "Deep-dive library usage trends by hour, week, faculty and check-in channel." },
      { property: "og:title", content: "Analytics — LibraPass" },
      { property: "og:description", content: "Library usage analytics and channel adoption." },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.452 0.109 161.5)", "oklch(0.62 0.13 250)", "oklch(0.78 0.16 78)"];
const axis = { stroke: "oklch(0.554 0.046 257.417)", fontSize: 11 };

function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Usage trends across access channels and faculties" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors today" value={dashboardStats.visitorsToday} accent />
        <StatCard label="Avg. visit duration" value={dashboardStats.averageVisit} delay={0.05} />
        <StatCard label="Peak hour" value={dashboardStats.peakHour} delay={0.1} />
        <StatCard label="QR adoption" value="53%" sub="of all check-ins" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardHeader title="Check-ins through the day" description="Hourly, today" />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyCheckIns}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" vertical={false} />
                <XAxis dataKey="hour" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="checkIns" stroke={COLORS[0]} strokeWidth={2.5} fill="url(#area)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Channel adoption" description="QR vs ID card vs Web" />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="label" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  {channelSplit.map((entry, i) => (
                    <Cell key={entry.channel} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Weekly visits" description="Last 7 days" />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" vertical={false} />
                <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.968 0.007 247.896)" }} />
                <Bar dataKey="visits" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Faculty usage" description="Visits this month by faculty" />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" vertical={false} />
                <XAxis dataKey="faculty" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.968 0.007 247.896)" }} />
                <Bar dataKey="visits" fill={COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}