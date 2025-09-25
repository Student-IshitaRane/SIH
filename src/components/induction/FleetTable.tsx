import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { useFleet } from '../../hooks/useApi';
import {
  formatNumber,
  formatDate,
  getDepotColor,
  getFitnessScoreColor,
  getMileageColor,
  getStatusColor,
} from '../../utils';
import { SortAsc, SortDesc } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface FleetTableProps {
  selectedTrains: string[];
  onTrainSelect: (trainId: string) => void;
  onTrainDeselect: (trainId: string) => void;
}

type SortField =
  | 'id'
  | 'depot'
  | 'mileage_km'
  | 'fitness_score'
  | 'last_maintenance'
  | 'branding_campaign';
type SortDirection = 'asc' | 'desc';

export const FleetTable: React.FC<FleetTableProps> = ({
  selectedTrains,
  onTrainSelect,
  onTrainDeselect,
}) => {
  const { data: fleet, isLoading, error } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [depotFilter, setDepotFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedFleet = useMemo(() => {
    if (!fleet) return [];

    let filtered = fleet.filter((train) => {
      const matchesSearch =
        train.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.branding_campaign
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesDepot = depotFilter === 'all' || train.depot === depotFilter;
      return matchesSearch && matchesDepot;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'branding_campaign') {
        aVal = a.branding_campaign || '';
        bVal = b.branding_campaign || '';
      }

      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [fleet, searchTerm, depotFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <SortAsc className="h-4 w-4 text-gray-400" />;
    return sortDirection === 'asc' ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  };

  const handleTrainToggle = (trainId: string) => {
    if (selectedTrains.includes(trainId)) {
      onTrainDeselect(trainId);
    } else {
      onTrainSelect(trainId);
    }
  };

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

  if (error || !fleet) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-danger-600">
          Failed to load fleet data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Overview</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search trains or campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={depotFilter}
              onChange={(e) => setDepotFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Depots</option>
              <option value="A">Depot A</option>
              <option value="B">Depot B</option>
              <option value="C">Depot C</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedTrains.length === filteredAndSortedFleet.length &&
                      filteredAndSortedFleet.length > 0
                    }
                    onChange={() => {
                      if (
                        selectedTrains.length === filteredAndSortedFleet.length
                      ) {
                        filteredAndSortedFleet.forEach((train) =>
                          onTrainDeselect(train.id)
                        );
                      } else {
                        filteredAndSortedFleet.forEach((train) =>
                          onTrainSelect(train.id)
                        );
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Train ID
                    {getSortIcon('id')}
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => handleSort('depot')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Depot
                    {getSortIcon('depot')}
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => handleSort('mileage_km')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Mileage
                    {getSortIcon('mileage_km')}
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => handleSort('fitness_score')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Fitness
                    {getSortIcon('fitness_score')}
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => handleSort('last_maintenance')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Last Maintenance
                    {getSortIcon('last_maintenance')}
                  </button>
                </th>
                <th className="text-left py-3 px-2">
                  <button
                    onClick={() => handleSort('branding_campaign')}
                    className="flex items-center gap-1 hover:text-primary-600"
                  >
                    Branding
                    {getSortIcon('branding_campaign')}
                  </button>
                </th>
                <th className="text-left py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedFleet.map((train) => (
                <tr
                  key={train.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    selectedTrains.includes(train.id) ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="py-3 px-2">
                    <input
                      type="checkbox"
                      checked={selectedTrains.includes(train.id)}
                      onChange={() => handleTrainToggle(train.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {train.id}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getDepotColor(train.depot)}`}
                    >
                      {train.depot}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getMileageColor(train.mileage_km)}`}
                    >
                      {formatNumber(train.mileage_km)} km
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getFitnessScoreColor(train.fitness_score)}`}
                    >
                      {formatNumber(train.fitness_score * 100, 1)}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {formatDate(train.last_maintenance)}
                  </td>
                  <td className="py-3 px-2">
                    {train.branding_campaign ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {train.branding_campaign}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(train.available ? 'available' : 'unavailable')}`}
                    >
                      {train.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedFleet.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trains found matching your criteria
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedFleet.length} of {fleet.length} trains
          {selectedTrains.length > 0 && (
            <span className="ml-2 text-primary-600">
              • {selectedTrains.length} selected
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
