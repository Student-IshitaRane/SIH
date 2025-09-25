import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSimulate } from '../hooks/useApi';
import { formatNumber, formatPercentage } from '../utils';
import {
  Brain,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Simulator: React.FC = () => {
  const [simulationParams, setSimulationParams] = useState({
    depot_availability: {
      depot_a: true,
      depot_b: true,
      depot_c: true,
    },
    unavailable_trains: [] as string[],
    fitness_overrides: {} as Record<string, number>,
  });

  const [results, setResults] = useState<any>(null);
  const simulateMutation = useSimulate();

  const handleRunSimulation = async () => {
    try {
      const result = await simulateMutation.mutateAsync(simulationParams);
      setResults(result);
      toast.success('Simulation completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Simulation failed');
    }
  };

  const handleReset = () => {
    setSimulationParams({
      depot_availability: {
        depot_a: true,
        depot_b: true,
        depot_c: true,
      },
      unavailable_trains: [],
      fitness_overrides: {},
    });
    setResults(null);
  };

  const toggleDepot = (depot: 'depot_a' | 'depot_b' | 'depot_c') => {
    setSimulationParams((prev) => ({
      ...prev,
      depot_availability: {
        ...prev.depot_availability,
        [depot]: !prev.depot_availability[depot],
      },
    }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            What-If Simulator
          </h1>
          <p className="text-gray-600 mt-1">
            Test different scenarios and analyze their impact on induction
            planning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Simulation Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Depot Availability */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Depot Availability
                </h4>
                <div className="space-y-2">
                  {(['depot_a', 'depot_b', 'depot_c'] as const).map((depot) => (
                    <label key={depot} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={simulationParams.depot_availability[depot]}
                        onChange={() => toggleDepot(depot)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {depot.replace('depot_', 'Depot ').toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Unavailable Trains */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Unavailable Trains
                </h4>
                <input
                  type="text"
                  placeholder="Enter train IDs (e.g., T01, T02, T03)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => {
                    const trains = e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setSimulationParams((prev) => ({
                      ...prev,
                      unavailable_trains: trains,
                    }));
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple train IDs with commas
                </p>
              </div>

              {/* Fitness Overrides */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Fitness Score Overrides
                </h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Train ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Score (0-1)"
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Override specific train fitness scores for testing
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleRunSimulation}
                  loading={simulateMutation.isPending}
                  disabled={simulateMutation.isPending}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={simulateMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Simulation Results */}
          <div>
            {simulateMutation.isPending ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Running simulation...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This may take a few moments
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : results ? (
              <div className="space-y-6">
                {/* Results Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Simulation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Inducted Count */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            Trains Inducted
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              results.delta.inducted >= 0
                                ? 'text-success-600'
                                : 'text-danger-600'
                            }`}
                          >
                            {results.delta.inducted >= 0 ? '+' : ''}
                            {results.delta.inducted}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Baseline: {results.baseline.inducted}</span>
                          <span>Simulation: {results.simulation.inducted}</span>
                        </div>
                      </div>

                      {/* Punctuality */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            Punctuality
                          </span>
                          <span
                            className={`text-lg font-bold flex items-center gap-1 ${
                              results.delta.punctuality >= 0
                                ? 'text-success-600'
                                : 'text-danger-600'
                            }`}
                          >
                            {results.delta.punctuality >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {results.delta.punctuality >= 0 ? '+' : ''}
                            {formatNumber(results.delta.punctuality, 1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            Baseline:{' '}
                            {formatNumber(results.baseline.punctuality, 1)}%
                          </span>
                          <span>
                            Simulation:{' '}
                            {formatNumber(results.simulation.punctuality, 1)}%
                          </span>
                        </div>
                      </div>

                      {/* Cost Savings */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            Cost Savings
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              results.delta.cost_savings >= 0
                                ? 'text-success-600'
                                : 'text-danger-600'
                            }`}
                          >
                            ₹{results.delta.cost_savings >= 0 ? '+' : ''}
                            {formatNumber(results.delta.cost_savings)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            Baseline: ₹
                            {formatNumber(results.baseline.cost_savings)}
                          </span>
                          <span>
                            Simulation: ₹
                            {formatNumber(results.simulation.cost_savings)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.recommendations.map(
                        (rec: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm text-blue-800">{rec}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Simulation Results
                    </h3>
                    <p className="text-gray-600">
                      Configure parameters and run a simulation to see results
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
