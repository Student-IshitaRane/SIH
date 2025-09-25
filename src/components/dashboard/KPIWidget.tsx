import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn, formatPercentage, formatCurrency } from '../../utils';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  format?: 'percentage' | 'currency' | 'number';
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  target,
  trend,
  format = 'number',
  icon,
  description,
  className,
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return formatPercentage(val);
      case 'currency':
        return formatCurrency(val);
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const isAboveTarget = value >= target;
  const targetGap = Math.abs(value - target);

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatValue(value)}
            </span>
            <div className={cn('flex items-center gap-1', getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">
                Target: {formatValue(target)}
              </span>
            </div>
            <span
              className={cn(
                'font-medium',
                isAboveTarget ? 'text-success-600' : 'text-warning-600'
              )}
            >
              {isAboveTarget ? '+' : '-'}
              {formatValue(targetGap)}
            </span>
          </div>

          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                isAboveTarget ? 'bg-success-500' : 'bg-warning-500'
              )}
              style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
