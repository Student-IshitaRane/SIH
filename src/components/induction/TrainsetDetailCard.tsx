import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Trainset, OptimizationResult } from '../../types';
import {
  formatNumber,
  formatDate,
  getDepotColor,
  getFitnessScoreColor,
  getMileageColor,
} from '../../utils';
import {
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
  Star,
  MapPin,
  DollarSign,
  Megaphone,
  Info,
} from 'lucide-react';

interface TrainsetDetailCardProps {
  train: Trainset;
  result: OptimizationResult;
  onDecision: (trainId: string, action: string, note?: string) => void;
  decision?: { action: string; note?: string };
}

export const TrainsetDetailCard: React.FC<TrainsetDetailCardProps> = ({
  train,
  result,
  onDecision,
  decision,
}) => {
  const [note, setNote] = useState(decision?.note || '');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleAction = (action: string) => {
    if (
      action !== decision?.action &&
      (action === 'reject' || action === 'maintenance')
    ) {
      setShowNoteInput(true);
    } else {
      onDecision(train.id, action, note || undefined);
      setShowNoteInput(false);
    }
  };

  const handleSubmitNote = () => {
    if (note.trim()) {
      const action = decision?.action === 'induct' ? 'reject' : 'maintenance';
      onDecision(train.id, action, note);
      setShowNoteInput(false);
    }
  };

  const getActionButtonVariant = (action: string) => {
    if (decision?.action === action) return 'primary';
    switch (action) {
      case 'induct':
        return 'success';
      case 'standby':
        return 'secondary';
      case 'maintenance':
        return 'warning';
      case 'reject':
        return 'danger';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Train Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Depot Information
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getDepotColor(train.depot)}`}
              >
                Depot {train.depot}
              </span>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="text-gray-600">Model: {train.model}</div>
            <div className="text-gray-600">
              Capacity: {train.capacity} passengers
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Performance Metrics
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fitness Score:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getFitnessScoreColor(train.fitness_score)}`}
              >
                {formatNumber(train.fitness_score * 100, 1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mileage:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getMileageColor(train.mileage_km)}`}
              >
                {formatNumber(train.mileage_km)} km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Maintenance:</span>
              <span className="text-gray-900">
                {formatDate(train.last_maintenance)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Branding & Business
          </h4>
          <div className="space-y-1 text-sm">
            {train.branding_campaign ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Campaign:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {train.branding_campaign}
                </span>
              </div>
            ) : (
              <div className="text-gray-500">No active campaign</div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Priority Score:</span>
              <span className="font-medium">{result.branding_priority}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            AI Recommendation Reasoning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">
                Positive Factors:
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.reasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full"
                  >
                    {reason.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {result.conflicts.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Conflicts & Issues:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {result.conflicts.map((conflict, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-danger-100 text-danger-800 text-xs rounded-full"
                    >
                      {conflict.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Depot Balance Impact:
                </span>
                <span className="font-medium">
                  {formatNumber(result.depot_balance_impact * 100, 0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Branding Priority:
                </span>
                <span className="font-medium">
                  {result.branding_priority}/10
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Actions */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Decision Actions</h4>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={getActionButtonVariant('induct')}
            size="sm"
            onClick={() => handleAction('induct')}
            disabled={decision?.action === 'induct'}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {decision?.action === 'induct'
              ? 'Approved for Induction'
              : 'Approve Induction'}
          </Button>

          <Button
            variant={getActionButtonVariant('standby')}
            size="sm"
            onClick={() => handleAction('standby')}
            disabled={decision?.action === 'standby'}
          >
            <Clock className="h-4 w-4 mr-1" />
            {decision?.action === 'standby'
              ? 'Marked as Standby'
              : 'Mark Standby'}
          </Button>

          <Button
            variant={getActionButtonVariant('maintenance')}
            size="sm"
            onClick={() => handleAction('maintenance')}
            disabled={decision?.action === 'maintenance'}
          >
            <Wrench className="h-4 w-4 mr-1" />
            {decision?.action === 'maintenance'
              ? 'Sent to Maintenance'
              : 'Send to Maintenance'}
          </Button>

          <Button
            variant={getActionButtonVariant('reject')}
            size="sm"
            onClick={() => handleAction('reject')}
            disabled={decision?.action === 'reject'}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            {decision?.action === 'reject' ? 'Rejected' : 'Reject'}
          </Button>
        </div>

        {/* Note input for overrides */}
        {showNoteInput && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Justification Required
            </label>
            <Input
              placeholder="Please provide justification for this decision..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmitNote}
                disabled={!note.trim()}
              >
                Submit Decision
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNoteInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {decision?.note && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Justification:</span>{' '}
              {decision.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
