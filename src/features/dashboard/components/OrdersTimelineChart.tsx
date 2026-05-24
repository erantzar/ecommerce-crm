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
import type { Order } from '@/types';

type Granularity = 'day' | 'month' | 'year';
type Metric = 'orders' | 'revenue';

interface Props {
  orders: Order[];
}

const chartConfig = {
  orders: {
    label: 'Orders',
    color: 'var(--chart-1)',
  },
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)',
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

export default function OrdersTimelineChart({ orders }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [activeMetric, setActiveMetric] = useState<Metric>('orders');

  const { data, totals, rangeLabel } = useMemo(() => {
    // Exclude cancelled orders from all revenue and count calculations
    const activeOrders = orders.filter((o) => o.orderStatus !== 'cancelled');

    const buckets: Record<string, { orders: number; revenue: number }> = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const order of activeOrders) {
      const date = new Date(order.createdAt);
      if (isNaN(date.getTime())) continue;
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
      const key = getKey(date, granularity);
      if (!buckets[key]) buckets[key] = { orders: 0, revenue: 0 };
      buckets[key].orders += 1;
      buckets[key].revenue += order.totalprice ?? 0;
    }

    const rows = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, values]) => ({
        label: formatLabel(key, granularity),
        orders: values.orders,
        revenue: Math.round(values.revenue * 100) / 100,
      }));

    const totals = {
      orders: activeOrders.length,
      revenue: activeOrders.reduce((sum, o) => sum + (o.totalprice ?? 0), 0),
    };

    const fmtDate = (d: Date) =>
      d.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    const rangeLabel =
      minDate && maxDate ? `${fmtDate(minDate)} – ${fmtDate(maxDate)}` : 'No data';

    return { data: rows, totals, rangeLabel };
  }, [orders, granularity]);

  const granularityButtons: { label: string; value: Granularity }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Orders Over Time</CardTitle>
          <CardDescription>{rangeLabel}</CardDescription>
        </div>
        <div className="flex">
          {(['orders', 'revenue'] as const).map((key) => {
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
                  {key === 'revenue'
                    ? `$${totals.revenue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : totals.orders.toLocaleString('en-US')}
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
            No order data available
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
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
                width={40}
                allowDecimals={activeMetric === 'revenue'}
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
