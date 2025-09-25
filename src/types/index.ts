export interface Trainset {
  id: string;
  depot: 'A' | 'B' | 'C';
  mileage_km: number;
  last_maintenance: string;
  maintenance_flag: boolean;
  fitness_score: number;
  branding_campaign?: string;
  available: boolean;
  model: string;
  capacity: number;
}

export interface OptimizationResult {
  id: string;
  score: number;
  confidence: number;
  reasons: string[];
  conflicts: string[];
  depot_balance_impact: number;
  branding_priority: number;
}

export interface OptimizationRun {
  run_id: string;
  date: string;
  ranked: OptimizationResult[];
  meta: {
    execution_time_ms: number;
    total_trains: number;
    depot_balance: boolean;
    weighting: {
      reliability: number;
      branding: number;
      cost: number;
    };
  };
}

export interface Decision {
  id: string;
  action: 'induct' | 'standby' | 'maintenance' | 'reject';
  operator: string;
  note?: string;
  timestamp: string;
}

export interface DecisionSnapshot {
  snapshot_id: string;
  date: string;
  operator: string;
  run_id: string;
  summary: {
    inducted: number;
    standby: number;
    maintenance: number;
    rejected: number;
  };
  decisions: Decision[];
  reasons: Array<{
    id: string;
    why: string[];
    action: string;
  }>;
}

export interface MaintenanceJob {
  id: string;
  train_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  expected_days: number;
  depot: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  assigned_crew?: string;
  start_date?: string;
  completion_date?: string;
}

export interface Alert {
  id: string;
  train_id: string;
  type:
    | 'fitness_fail'
    | 'maintenance_overdue'
    | 'depot_full'
    | 'branding_expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  message: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
}

export interface BrandingCampaign {
  id: string;
  name: string;
  description: string;
  priority: number;
  start_date: string;
  end_date: string;
  target_trains: string[];
  status: 'active' | 'paused' | 'completed';
  visibility_score: number;
}

export interface KPIMetrics {
  punctuality: {
    on_time_percentage: number;
    target_percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  maintenance_cost: {
    savings_estimate: number;
    target_savings: number;
    trend: 'up' | 'down' | 'stable';
  };
  transparency: {
    auto_explained_percentage: number;
    target_percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  depot_utilization: {
    depot_a: number;
    depot_b: number;
    depot_c: number;
    average: number;
  };
}

export interface SimulationParams {
  depot_availability: {
    depot_a: boolean;
    depot_b: boolean;
    depot_c: boolean;
  };
  unavailable_trains: string[];
  fitness_overrides: Record<string, number>;
  branding_priority_override?: Record<string, number>;
}

export interface SimulationResult {
  baseline: {
    inducted: number;
    punctuality: number;
    cost_savings: number;
  };
  simulation: {
    inducted: number;
    punctuality: number;
    cost_savings: number;
  };
  delta: {
    inducted: number;
    punctuality: number;
    cost_savings: number;
  };
  recommendations: string[];
}

export interface User {
  id: string;
  username: string;
  role: 'supervisor' | 'operator' | 'admin';
  name: string;
  depot_access: string[];
  permissions: string[];
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  status: 'success' | 'error';
  message?: string;
}
