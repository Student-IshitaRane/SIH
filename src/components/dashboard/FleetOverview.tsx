import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useFleet } from '../../hooks/useApi';
import { formatNumber, getDepotColor, getFitnessScoreColor } from '../../utils';
import { Train, Clock, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const FleetOverview: React.FC = () => {
  const { data: fleet, isLoading, error } = useFleet();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading fleet data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-danger-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Failed to load fleet data
        </CardContent>
      </Card>
    );
  }

  if (!fleet) return null;

  // Calculate fleet statistics
  const totalTrains = fleet.length;
  const availableTrains = fleet.filter((train) => train.available).length;
  const underMaintenance = fleet.filter(
    (train) => train.maintenance_flag || !train.available
  ).length;
  const standbyTrains = totalTrains - availableTrains - underMaintenance;

  // Group by depot
  const depotStats = fleet.reduce(
    (acc, train) => {
      if (!acc[train.depot]) {
        acc[train.depot] = { total: 0, available: 0, maintenance: 0 };
      }
      acc[train.depot].total++;
      if (train.available && !train.maintenance_flag) {
        acc[train.depot].available++;
      } else {
        acc[train.depot].maintenance++;
      }
      return acc;
    },
    {} as Record<
      string,
      { total: number; available: number; maintenance: number }
    >
  );

  // Calculate average fitness score
  const avgFitnessScore =
    fleet.reduce((sum, train) => sum + train.fitness_score, 0) / totalTrains;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fleet Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Train className="h-5 w-5" />
            Fleet Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {totalTrains}
              </div>
              <div className="text-sm text-gray-600">Total Fleet</div>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {availableTrains}
              </div>
              <div className="text-sm text-success-600">Available</div>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <div className="text-2xl font-bold text-warning-600">
                {standbyTrains}
              </div>
              <div className="text-sm text-warning-600">Standby</div>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-lg">
              <div className="text-2xl font-bold text-danger-600">
                {underMaintenance}
              </div>
              <div className="text-sm text-danger-600">Maintenance</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Average Fitness Score
              </span>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${getFitnessScoreColor(avgFitnessScore)}`}
              >
                {formatNumber(avgFitnessScore * 100, 1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depot Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Depot Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(depotStats).map(([depot, stats]) => (
              <div key={depot} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getDepotColor(depot)}`}
                    >
                      Depot {depot}
                    </span>
                    <span className="text-sm text-gray-600">
                      {stats.total} trains
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatNumber((stats.available / stats.total) * 100, 0)}%
                    available
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="flex h-2 rounded-full">
                    <div
                      className="bg-success-500"
                      style={{
                        width: `${(stats.available / stats.total) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-danger-500"
                      style={{
                        width: `${(stats.maintenance / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stats.available} available</span>
                  <span>{stats.maintenance} maintenance</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
