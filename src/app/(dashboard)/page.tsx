'use client';

import { useEffect } from 'react';
import { DollarSign, Users, Package, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import { fetchDashboardData } from '@/features/dashboard/store/dashboardThunks';
import StatCard from '@/features/dashboard/components/StatCard';
import OrdersTimelineChart from '@/features/dashboard/components/OrdersTimelineChart';
import NewUsersChart from '@/features/dashboard/components/NewUsersChart';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { metrics, status, error } = useAppSelector((s) => s.dashboard);
  const isLoading = status === 'loading' || status === 'idle';

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {status === 'failed' && (
          <p className="text-sm text-destructive bg-destructive/10 rounded p-3">
            Failed to load dashboard: {error}
          </p>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={metrics?.totalUsers ?? 0}
            icon={Users}
            loading={isLoading}
          />
          <StatCard
            title="Total Products"
            value={metrics?.totalProducts ?? 0}
            icon={Package}
            loading={isLoading}
          />
          <StatCard
            title="Pending Orders"
            value={metrics?.pendingOrders ?? 0}
            icon={Clock}
            loading={isLoading}
          />
          <StatCard
            title="Revenue (est.)"
            value={`$${(metrics?.approximateRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            loading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {metrics && metrics.allOrders.length > 0 && (
            <OrdersTimelineChart orders={metrics.allOrders} />
          )}
          {metrics && metrics.allUsers.length > 0 && (
            <NewUsersChart users={metrics.allUsers} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
