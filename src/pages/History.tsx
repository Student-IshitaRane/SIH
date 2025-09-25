import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useHistory, useExportCSV, useExportPDF } from '../hooks/useApi';
import { formatDate, formatRelativeTime } from '../utils';
import {
  History as HistoryIcon,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const History: React.FC = () => {
  const { data: history, isLoading } = useHistory();
  const exportCSVMutation = useExportCSV();
  const exportPDFMutation = useExportPDF();
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredHistory =
    history?.filter((snapshot) => {
      const matchesSearch =
        snapshot.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snapshot.snapshot_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate =
        dateFilter === 'all' ||
        new Date(snapshot.date).toDateString() ===
          new Date(dateFilter).toDateString();
      return matchesSearch && matchesDate;
    }) || [];

  const handleExportCSV = async () => {
    try {
      const result = await exportCSVMutation.mutateAsync({
        date_range: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      });

      // Simulate download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV export started');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await exportPDFMutation.mutateAsync({
        date_range: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
      });

      // Simulate download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('PDF export started');
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              History & Export
            </h1>
            <p className="text-gray-600 mt-1">
              View past induction decisions and export reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              loading={exportCSVMutation.isPending}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              loading={exportPDFMutation.isPending}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <HistoryIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Snapshots</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history?.filter(
                      (s) =>
                        new Date(s.date).getMonth() === new Date().getMonth() &&
                        new Date(s.date).getFullYear() ===
                          new Date().getFullYear()
                    ).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <User className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Operators</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(history?.map((s) => s.operator) || []).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Decisions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history?.length
                      ? Math.round(
                          history.reduce(
                            (acc, s) => acc + s.decisions.length,
                            0
                          ) / history.length
                        )
                      : 0}
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
              Decision History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by operator or snapshot ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
              {filteredHistory.map((snapshot) => (
                <div
                  key={snapshot.snapshot_id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          Snapshot {snapshot.snapshot_id}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Run {snapshot.run_id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatDate(snapshot.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            {snapshot.operator}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">
                            {snapshot.decisions.length}
                          </span>{' '}
                          decisions
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">
                            {formatRelativeTime(snapshot.date)}
                          </span>
                        </div>
                      </div>

                      {/* Decision Summary */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full">
                          {snapshot.summary.inducted} inducted
                        </div>
                        <div className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded-full">
                          {snapshot.summary.standby} standby
                        </div>
                        <div className="px-2 py-1 bg-danger-100 text-danger-800 text-xs rounded-full">
                          {snapshot.summary.maintenance} maintenance
                        </div>
                        {snapshot.summary.rejected > 0 && (
                          <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {snapshot.summary.rejected} rejected
                          </div>
                        )}
                      </div>

                      {/* Decision Details */}
                      <div className="text-sm">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Decisions Made:
                        </h4>
                        <div className="space-y-1">
                          {snapshot.decisions
                            .slice(0, 5)
                            .map((decision, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-gray-600"
                              >
                                <span className="font-medium">
                                  {decision.id}:
                                </span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  {decision.action}
                                </span>
                                {decision.note && (
                                  <span className="text-gray-500">
                                    - {decision.note}
                                  </span>
                                )}
                              </div>
                            ))}
                          {snapshot.decisions.length > 5 && (
                            <div className="text-gray-500 text-xs">
                              ... and {snapshot.decisions.length - 5} more
                              decisions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedSnapshot(
                            selectedSnapshot === snapshot.snapshot_id
                              ? null
                              : snapshot.snapshot_id
                          )
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {selectedSnapshot === snapshot.snapshot_id
                          ? 'Hide'
                          : 'View'}{' '}
                        Details
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedSnapshot === snapshot.snapshot_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-4">
                        {/* Reasoning Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Reasoning Logs:
                          </h4>
                          <div className="space-y-2">
                            {snapshot.reasons.map((reason, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {reason.id}
                                  </span>
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded">
                                    {reason.action}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {reason.why.map((reasonText, reasonIdx) => (
                                    <span
                                      key={reasonIdx}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                      {reasonText}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No history found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
