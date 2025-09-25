import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { FleetTable } from '../components/induction/FleetTable';
import { RankedList } from '../components/induction/RankedList';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { useFleet, useOptimize, useSaveDecisions } from '../hooks/useApi';
import { useAuthStore } from '../store/useAuthStore';
import { useInductionStore } from '../store/useInductionStore';
import { formatDate } from '../utils';
import {
  Play,
  Save,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const InductionDecisions: React.FC = () => {
  const { data: fleet, isLoading: fleetLoading } = useFleet();
  const { user } = useAuthStore();
  const {
    currentRun,
    decisions,
    published,
    setCurrentRun,
    addDecision,
    setPublished,
  } = useInductionStore();

  const [selectedTrains, setSelectedTrains] = useState<string[]>([]);
  const [optimizationParams, setOptimizationParams] = useState({
    weighting: {
      reliability: 0.6,
      branding: 0.2,
      cost: 0.2,
    },
    depot_balance: true,
  });

  const optimizeMutation = useOptimize();
  const saveDecisionsMutation = useSaveDecisions();

  const handleOptimize = async () => {
    if (!fleet || fleet.length === 0) {
      toast.error('No fleet data available');
      return;
    }

    try {
      const result = await optimizeMutation.mutateAsync({
        date: new Date().toISOString().split('T')[0],
        params: optimizationParams,
      });

      setCurrentRun(result);
      toast.success('AI optimization completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Optimization failed');
    }
  };

  const handleDecision = (trainId: string, action: string, note?: string) => {
    addDecision({
      id: trainId,
      action: action as any,
      operator: user?.username || 'unknown',
      note,
      timestamp: new Date().toISOString(),
    });

    toast.success(`Decision recorded for ${trainId}`);
  };

  const handleSaveAndPublish = async () => {
    if (!currentRun) {
      toast.error('No optimization results to save');
      return;
    }

    if (Object.keys(decisions).length === 0) {
      toast.error('No decisions made yet');
      return;
    }

    try {
      const decisionsArray = Object.entries(decisions).map(
        ([id, decision]) => ({
          id,
          action: decision.action,
          operator: user?.username || 'unknown',
          note: decision.note,
        })
      );

      await saveDecisionsMutation.mutateAsync({
        run_id: currentRun.run_id,
        decisions: decisionsArray,
        published: true,
      });

      setPublished(true);
      toast.success('Decisions saved and published successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save decisions');
    }
  };

  const handleTrainSelect = (trainId: string) => {
    setSelectedTrains((prev) => [...prev, trainId]);
  };

  const handleTrainDeselect = (trainId: string) => {
    setSelectedTrains((prev) => prev.filter((id) => id !== trainId));
  };

  const getDecisionSummary = () => {
    const summary = Object.values(decisions).reduce(
      (acc, decision) => {
        acc[decision.action] = (acc[decision.action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return summary;
  };

  const decisionSummary = getDecisionSummary();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Induction Decisions
          </h1>
          <p className="text-gray-600 mt-1">
            AI-driven train induction planning and decision management
          </p>
        </div>

        {/* Optimization Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Optimization Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Reliability Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={optimizationParams.weighting.reliability}
                  onChange={(e) =>
                    setOptimizationParams((prev) => ({
                      ...prev,
                      weighting: {
                        ...prev.weighting,
                        reliability: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  {Math.round(optimizationParams.weighting.reliability * 100)}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Branding Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={optimizationParams.weighting.branding}
                  onChange={(e) =>
                    setOptimizationParams((prev) => ({
                      ...prev,
                      weighting: {
                        ...prev.weighting,
                        branding: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  {Math.round(optimizationParams.weighting.branding * 100)}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Cost Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={optimizationParams.weighting.cost}
                  onChange={(e) =>
                    setOptimizationParams((prev) => ({
                      ...prev,
                      weighting: {
                        ...prev.weighting,
                        cost: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-600">
                  {Math.round(optimizationParams.weighting.cost * 100)}%
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleOptimize}
                  loading={optimizeMutation.isPending}
                  disabled={optimizeMutation.isPending || fleetLoading}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Optimizer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Decision Summary */}
        {Object.keys(decisions).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Decision Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(decisionSummary).map(([action, count]) => (
                  <div
                    key={action}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{action}:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleSaveAndPublish}
                  loading={saveDecisionsMutation.isPending}
                  disabled={published}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {published ? 'Published' : 'Save & Publish'}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Fleet Table */}
          <div>
            <FleetTable
              selectedTrains={selectedTrains}
              onTrainSelect={handleTrainSelect}
              onTrainDeselect={handleTrainDeselect}
            />
          </div>

          {/* AI Recommendations */}
          <div>
            {currentRun ? (
              <RankedList
                results={currentRun.ranked}
                fleet={fleet || []}
                onDecision={handleDecision}
                decisions={Object.fromEntries(
                  decisions.map((d) => [
                    d.id,
                    {
                      action: d.action,
                      note: d.note,
                      operator: d.operator,
                      timestamp: d.timestamp,
                    },
                  ])
                )}
                loading={optimizeMutation.isPending}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Optimization Results
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Run the AI optimizer to generate induction recommendations
                    </p>
                    <Button
                      onClick={handleOptimize}
                      loading={optimizeMutation.isPending}
                      disabled={optimizeMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Optimization Results Meta */}
        {currentRun && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Optimization Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Execution Time:</span>
                  <div className="font-medium">
                    {currentRun.meta.execution_time_ms}ms
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Trains:</span>
                  <div className="font-medium">
                    {currentRun.meta.total_trains}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Depot Balance:</span>
                  <div className="font-medium">
                    {currentRun.meta.depot_balance ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Generated:</span>
                  <div className="font-medium">
                    {formatDate(currentRun.date)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};
