import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useAlerts } from '../../hooks/useApi';
import { formatRelativeTime, getSeverityColor } from '../../utils';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const RecentAlerts: React.FC = () => {
  const { data: alerts, isLoading, error } = useAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading alerts...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-danger-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Failed to load alerts
        </CardContent>
      </Card>
    );
  }

  if (!alerts) return null;

  const recentAlerts = alerts
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 5);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'fitness_fail':
        return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance_overdue':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success-500" />
            <p>No recent alerts</p>
            <p className="text-sm">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.resolved
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1 rounded-full ${
                        alert.resolved
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-danger-100 text-danger-600'
                      }`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          Train {alert.train_id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(alert.timestamp)}</span>
                        {alert.resolved && (
                          <>
                            <span>•</span>
                            <span>Resolved by {alert.resolved_by}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {alert.resolved && (
                    <CheckCircle className="h-4 w-4 text-success-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
