import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAlerts } from '../hooks/useApi';
import { formatRelativeTime, getSeverityColor } from '../utils';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { data: alerts, isLoading, error, refetch } = useAlerts();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts =
    alerts?.filter((alert) => {
      const matchesSeverity =
        severityFilter === 'all' || alert.severity === severityFilter;
      const matchesType = typeFilter === 'all' || alert.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'resolved' && alert.resolved) ||
        (statusFilter === 'unresolved' && !alert.resolved);
      const matchesSearch =
        alert.train_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesType && matchesStatus && matchesSearch;
    }) || [];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fitness_fail':
        return <AlertTriangle className="h-5 w-5 text-danger-600" />;
      case 'maintenance_overdue':
        return <Clock className="h-5 w-5 text-warning-600" />;
      case 'depot_full':
        return <Bell className="h-5 w-5 text-primary-600" />;
      case 'branding_expired':
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fitness_fail':
        return 'Fitness Failure';
      case 'maintenance_overdue':
        return 'Maintenance Overdue';
      case 'depot_full':
        return 'Depot Full';
      case 'branding_expired':
        return 'Branding Expired';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-danger-600">Failed to load alerts</p>
          </div>
        </div>
      </Layout>
    );
  }

  const unresolvedCount =
    alerts?.filter((alert) => !alert.resolved).length || 0;
  const criticalCount =
    alerts?.filter((alert) => alert.severity === 'critical' && !alert.resolved)
      .length || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              IoT Alerts Feed
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring of train status and system alerts
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-danger-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unresolved Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {unresolvedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <Bell className="h-5 w-5 text-danger-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {criticalCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {alerts?.filter(
                      (alert) =>
                        alert.resolved &&
                        alert.resolved_at &&
                        new Date(alert.resolved_at).toDateString() ===
                          new Date().toDateString()
                    ).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Alerts Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by train ID or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="fitness_fail">Fitness Failure</option>
                  <option value="maintenance_overdue">
                    Maintenance Overdue
                  </option>
                  <option value="depot_full">Depot Full</option>
                  <option value="branding_expired">Branding Expired</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="unresolved">Unresolved</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 transition-all ${
                    alert.resolved
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          alert.resolved ? 'bg-gray-100' : 'bg-danger-100'
                        }`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            Train {alert.train_id}
                          </span>
                          <span className="text-sm text-gray-600">
                            {getTypeLabel(alert.type)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}
                          >
                            {alert.severity}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {alert.message}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(alert.timestamp)}</span>
                          </div>
                          {alert.resolved && (
                            <>
                              <span>•</span>
                              <span>Resolved by {alert.resolved_by}</span>
                              <span>•</span>
                              <span>
                                {formatRelativeTime(alert.resolved_at!)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.resolved ? (
                        <CheckCircle className="h-5 w-5 text-success-500" />
                      ) : (
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No alerts found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
