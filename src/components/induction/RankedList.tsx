import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { TrainsetDetailCard } from './TrainsetDetailCard';
import { OptimizationResult } from '../../types';
import { formatNumber } from '../../utils';
import { ChevronUp, ChevronDown, Star, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface RankedListProps {
  results: OptimizationResult[];
  fleet: any[];
  onDecision: (trainId: string, action: string, note?: string) => void;
  decisions: Record<
    string,
    { action: string; note?: string; operator?: string; timestamp?: string }
  >;
  loading?: boolean;
}

export const RankedList: React.FC<RankedListProps> = ({
  results,
  fleet,
  onDecision,
  decisions,
  loading = false,
}) => {
  const [expandedTrain, setExpandedTrain] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'confidence'>('score');

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'score') {
      return b.score - a.score;
    } else {
      return b.confidence - a.confidence;
    }
  });

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
          <Star className="h-3 w-3 mr-1" />
          High
        </span>
      );
    } else if (confidence >= 0.6) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
          Medium
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Low
        </span>
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-success-600';
    if (score >= 0.6) return 'text-warning-600';
    return 'text-danger-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Running AI optimizer...</p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results</h3>
          <p className="text-gray-600">
            Run the optimizer to generate induction recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Recommendations</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'score' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('score')}
            >
              Sort by Score
            </Button>
            <Button
              variant={sortBy === 'confidence' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('confidence')}
            >
              Sort by Confidence
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          AI-ranked list of trains recommended for induction based on fitness,
          depot balance, and branding priorities
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedResults.map((result, index) => {
            const train = fleet.find((t) => t.id === result.id);
            const decision = decisions[result.id];
            const isExpanded = expandedTrain === result.id;

            if (!train) return null;

            return (
              <div
                key={result.id}
                className={`border rounded-lg transition-all ${
                  decision
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          #{index + 1}
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          {result.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${getScoreColor(result.score)}`}
                        >
                          {formatNumber(result.score * 100, 1)}%
                        </span>
                        {getConfidenceBadge(result.confidence)}
                      </div>

                      {result.conflicts.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {result.conflicts.length} conflicts
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {decision && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium">
                          {decision.action}
                        </span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedTrain(isExpanded ? null : result.id)
                        }
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Quick reasons preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.reasons.slice(0, 3).map((reason, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {reason.replace(/-/g, ' ')}
                      </span>
                    ))}
                    {result.reasons.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{result.reasons.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <TrainsetDetailCard
                      train={train}
                      result={result}
                      onDecision={onDecision}
                      decision={decision}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-1 rounded-full">
              <Star className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">AI Optimization Summary</p>
              <p>
                Generated {results.length} recommendations based on fitness
                scores, depot balance, maintenance schedules, and branding
                priorities. Higher scores indicate better induction candidates.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
