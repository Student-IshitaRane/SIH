import React from 'react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useKPIs, useHistory } from '../hooks/useApi';
import { formatPercentage, formatCurrency } from '../utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data: kpis, isLoading: kpisLoading } = useKPIs();

  const isLoading = kpisLoading;

  // Generate sample data for charts
  const depotUtilizationData = [
    { name: 'Depot A', utilization: kpis?.depot_utilization.depot_a || 0 },
    { name: 'Depot B', utilization: kpis?.depot_utilization.depot_b || 0 },
    { name: 'Depot C', utilization: kpis?.depot_utilization.depot_c || 0 },
  ];

  const decisionTrendData = [
    { month: 'Jan', inducted: 45, standby: 12, maintenance: 8 },
    { month: 'Feb', inducted: 52, standby: 15, maintenance: 6 },
    { month: 'Mar', inducted: 48, standby: 18, maintenance: 9 },
    { month: 'Apr', inducted: 55, standby: 14, maintenance: 7 },
    { month: 'May', inducted: 61, standby: 16, maintenance: 5 },
    { month: 'Jun', inducted: 58, standby: 19, maintenance: 8 },
  ];

  const punctualityTrendData = [
    { week: 'Week 1', punctuality: 94.2, target: 95 },
    { week: 'Week 2', punctuality: 93.8, target: 95 },
    { week: 'Week 3', punctuality: 94.6, target: 95 },
    { week: 'Week 4', punctuality: 95.1, target: 95 },
  ];

  const maintenanceCostData = [
    { month: 'Jan', cost: 125000, savings: 15000 },
    { month: 'Feb', cost: 118000, savings: 22000 },
    { month: 'Mar', cost: 132000, savings: 18000 },
    { month: 'Apr', cost: 115000, savings: 25000 },
    { month: 'May', cost: 128000, savings: 19000 },
    { month: 'Jun', cost: 122000, savings: 23000 },
  ];

  const operatorPerformanceData = [
    { name: 'supervisor1', decisions: 45, accuracy: 94.2 },
    { name: 'operator1', decisions: 32, accuracy: 91.8 },
    { name: 'operator2', decisions: 28, accuracy: 93.5 },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analytics and performance insights
          </p>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Clock className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Punctuality</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(
                      kpis?.punctuality.on_time_percentage || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Target:{' '}
                    {formatPercentage(kpis?.punctuality.target_percentage || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      kpis?.maintenance_cost.savings_estimate || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Target:{' '}
                    {formatCurrency(kpis?.maintenance_cost.target_savings || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transparency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(
                      kpis?.transparency.auto_explained_percentage || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Target:{' '}
                    {formatPercentage(
                      kpis?.transparency.target_percentage || 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Depot Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(kpis?.depot_utilization.average || 0)}
                  </p>
                  <p className="text-xs text-gray-500">Across all depots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Depot Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Depot Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={depotUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatPercentage(Number(value)),
                      'Utilization',
                    ]}
                  />
                  <Bar dataKey="utilization" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Punctuality Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Punctuality Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={punctualityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatPercentage(Number(value)),
                      'Punctuality',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="punctuality"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Decision Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Decision Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={decisionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inducted" fill="#10b981" name="Inducted" />
                  <Bar dataKey="standby" fill="#f59e0b" name="Standby" />
                  <Bar
                    dataKey="maintenance"
                    fill="#ef4444"
                    name="Maintenance"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Maintenance Cost Savings */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Cost & Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={maintenanceCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      'Amount',
                    ]}
                  />
                  <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                  <Bar dataKey="savings" fill="#10b981" name="Savings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Operator Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Operator Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {operatorPerformanceData.map((operator, index) => (
                <div
                  key={operator.name}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-lg font-bold text-gray-900">
                    {operator.name}
                  </div>
                  <div className="text-2xl font-bold text-primary-600 mt-2">
                    {operator.decisions}
                  </div>
                  <div className="text-sm text-gray-600">Decisions Made</div>
                  <div className="text-lg font-bold text-success-600 mt-2">
                    {formatPercentage(operator.accuracy)}
                  </div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
