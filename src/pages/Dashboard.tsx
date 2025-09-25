import React from 'react';
import { Layout } from '../components/layout/Layout';
import { KPIWidget } from '../components/dashboard/KPIWidget';
import { FleetOverview } from '../components/dashboard/FleetOverview';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { useKPIs } from '../hooks/useApi';
import {
  Clock,
  DollarSign,
  Eye,
  BarChart3,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: kpis, isLoading, error } = useKPIs();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !kpis) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-danger-600">Failed to load dashboard data</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of train induction planning and fleet operations
          </p>
        </div>

        {/* KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPIWidget
            title="Punctuality"
            value={kpis.punctuality.on_time_percentage}
            target={kpis.punctuality.target_percentage}
            trend={kpis.punctuality.trend}
            format="percentage"
            icon={<Clock className="h-5 w-5" />}
            description="On-time induction percentage"
          />

          <KPIWidget
            title="Cost Savings"
            value={kpis.maintenance_cost.savings_estimate}
            target={kpis.maintenance_cost.target_savings}
            trend={kpis.maintenance_cost.trend}
            format="currency"
            icon={<DollarSign className="h-5 w-5" />}
            description="Maintenance cost reduction"
          />

          <KPIWidget
            title="Transparency"
            value={kpis.transparency.auto_explained_percentage}
            target={kpis.transparency.target_percentage}
            trend={kpis.transparency.trend}
            format="percentage"
            icon={<Eye className="h-5 w-5" />}
            description="Auto-explained decisions"
          />

          <KPIWidget
            title="Depot Utilization"
            value={kpis.depot_utilization.average}
            target={85}
            trend="stable"
            format="percentage"
            icon={<BarChart3 className="h-5 w-5" />}
            description="Average depot utilization"
          />
        </div>

        {/* Fleet Overview and Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FleetOverview />
          </div>
          <div>
            <RecentAlerts />
          </div>
        </div>

        {/* Depot Utilization Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(kpis.depot_utilization)
            .filter(([key]) => key !== 'average')
            .map(([depot, utilization]) => (
              <KPIWidget
                key={depot}
                title={`Depot ${depot.toUpperCase()} Utilization`}
                value={utilization}
                target={85}
                trend="stable"
                format="percentage"
                icon={<Activity className="h-5 w-5" />}
                description="Current depot utilization"
                className="lg:col-span-1"
              />
            ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <div className="text-left">
                <div className="font-medium text-primary-900">
                  Run Optimizer
                </div>
                <div className="text-sm text-primary-600">
                  Generate induction plan
                </div>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 rounded-lg hover:bg-success-100 transition-colors">
              <Activity className="h-5 w-5 text-success-600" />
              <div className="text-left">
                <div className="font-medium text-success-900">
                  View Maintenance
                </div>
                <div className="text-sm text-success-600">
                  Check maintenance queue
                </div>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 bg-warning-50 border border-warning-200 rounded-lg hover:bg-warning-100 transition-colors">
              <BarChart3 className="h-5 w-5 text-warning-600" />
              <div className="text-left">
                <div className="font-medium text-warning-900">
                  Simulate Changes
                </div>
                <div className="text-sm text-warning-600">What-if analysis</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
