'use client';

import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { AdminUser } from '@/types';

type Granularity = 'day' | 'month' | 'year';
type Metric = 'allUsers' | 'verifiedUsers';

interface Props {
  users: AdminUser[];
}

const chartConfig = {
  allUsers: {
    label: 'All Users',
    color: 'var(--chart-1)',
  },
  verifiedUsers: {
    label: 'Verified',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

function getKey(date: Date, granularity: Granularity): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  if (granularity === 'day') return `${y}-${m}-${d}`;
  if (granularity === 'month') return `${y}-${m}`;
  return `${y}`;
}

function formatLabel(key: string, granularity: Granularity): string {
  if (granularity === 'year') return key;
  if (granularity === 'month') {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    });
  }
  const [y, m, d] = key.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleString('default', {
    month: 'short',
    day: 'numeric',
  });
}

export default function NewUsersChart({ users }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [activeMetric, setActiveMetric] = useState<Metric>('allUsers');

  const { data, totals, rangeLabel } = useMemo(() => {
    const buckets: Record<string, { allUsers: number; verifiedUsers: number }> = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const user of users) {
      const date = new Date(user.createdAt);
      if (isNaN(date.getTime())) continue;
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
      const key = getKey(date, granularity);
      if (!buckets[key]) buckets[key] = { allUsers: 0, verifiedUsers: 0 };
      buckets[key].allUsers += 1;
      if (user.isVerified) buckets[key].verifiedUsers += 1;
    }

    const rows = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, values]) => ({
        period: formatLabel(key, granularity),
        allUsers: values.allUsers,
        verifiedUsers: values.verifiedUsers,
      }));

    const totals = {
      allUsers: users.length,
      verifiedUsers: users.filter((u) => u.isVerified).length,
    };

    const fmtDate = (d: Date) =>
      d.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    const rangeLabel =
      minDate && maxDate ? `${fmtDate(minDate)} – ${fmtDate(maxDate)}` : 'No data';

    return { data: rows, totals, rangeLabel };
  }, [users, granularity]);

  const granularityButtons: { label: string; value: Granularity }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>New User Registrations</CardTitle>
          <CardDescription>{rangeLabel}</CardDescription>
        </div>
        <div className="flex">
          {(['allUsers', 'verifiedUsers'] as const).map((key) => {
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                data-active={isActive}
                onClick={() => setActiveMetric(key)}
                className="relative z-10 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {totals[key].toLocaleString('en-US')}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-4 flex justify-end gap-1">
          {granularityButtons.map((b) => (
            <button
              key={b.value}
              onClick={() => setGranularity(b.value)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                granularity === b.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No user registration data available
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={28}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[160px]"
                    nameKey={activeMetric}
                    labelFormatter={(value) => value}
                  />
                }
              />
              <Bar dataKey={activeMetric} fill={`var(--color-${activeMetric})`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
