import {
  Trainset,
  OptimizationRun,
  DecisionSnapshot,
  MaintenanceJob,
  Alert,
  BrandingCampaign,
  KPIMetrics,
  SimulationParams,
  SimulationResult,
  User,
  ApiResponse,
  PaginatedResponse,
} from '../types';
import type { DatasetType, RowData } from '../utils/csv';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response
    );
  }

  return response.json();
}

export const api = {
  // Fleet endpoints
  async getFleet(): Promise<Trainset[]> {
    const response = await fetch(`${API_BASE_URL}/fleet`);
    return handleResponse<Trainset[]>(response);
  },

  // Optimization endpoints
  async optimize(params: {
    date: string;
    params: {
      weighting: {
        reliability: number;
        branding: number;
        cost: number;
      };
      depot_balance: boolean;
    };
  }): Promise<OptimizationRun> {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<OptimizationRun>(response);
  },

  // Decision endpoints
  async saveDecisions(params: {
    run_id: string;
    decisions: Array<{
      id: string;
      action: string;
      operator: string;
      note?: string;
    }>;
    published: boolean;
  }): Promise<{ status: string; snapshot_id: string }> {
    const response = await fetch(`${API_BASE_URL}/decisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{ status: string; snapshot_id: string }>(response);
  },

  // History endpoints
  async getHistory(): Promise<DecisionSnapshot[]> {
    const response = await fetch(`${API_BASE_URL}/history`);
    return handleResponse<DecisionSnapshot[]>(response);
  },

  // Maintenance endpoints
  async getMaintenance(): Promise<MaintenanceJob[]> {
    const response = await fetch(`${API_BASE_URL}/maintenance`);
    return handleResponse<MaintenanceJob[]>(response);
  },

  // Alerts endpoints
  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    return handleResponse<Alert[]>(response);
  },

  // Branding campaigns endpoints
  async getBrandingCampaigns(): Promise<BrandingCampaign[]> {
    const response = await fetch(`${API_BASE_URL}/branding-campaigns`);
    return handleResponse<BrandingCampaign[]>(response);
  },

  // KPI endpoints
  async getKPIs(): Promise<KPIMetrics> {
    const response = await fetch(`${API_BASE_URL}/kpis`);
    return handleResponse<KPIMetrics>(response);
  },

  // Simulation endpoints
  async simulate(params: SimulationParams): Promise<SimulationResult> {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<SimulationResult>(response);
  },

  // Auth endpoints
  async login(credentials: { username: string; password: string }): Promise<{
    user: User;
    token: string;
    expires_at: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{
      user: User;
      token: string;
      expires_at: string;
    }>(response);
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`);
    return handleResponse<User>(response);
  },

  // Export endpoints
  async exportCSV(params: {
    snapshot_id?: string;
    date_range?: {
      start: string;
      end: string;
    };
  }): Promise<{ download_url: string; filename: string; expires_at: string }> {
    const response = await fetch(`${API_BASE_URL}/export/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{
      download_url: string;
      filename: string;
      expires_at: string;
    }>(response);
  },

  async exportPDF(params: {
    snapshot_id?: string;
    date_range?: {
      start: string;
      end: string;
    };
  }): Promise<{ download_url: string; filename: string; expires_at: string }> {
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse<{
      download_url: string;
      filename: string;
      expires_at: string;
    }>(response);
  },

  // ML ingest endpoint
  async mlIngest(payload: {
    dataset: DatasetType;
    rows: RowData[];
  }): Promise<{ status: string; ingested: number; high_risk_ids?: string[] } & ApiResponse<unknown>> {
    const response = await fetch(`${API_BASE_URL}/ml/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ status: string; ingested: number; high_risk_ids?: string[] } & ApiResponse<unknown>>(response);
  },

  // Save per-feature data on backend so it can build master CSV server-side
  async mlSaveFeature(payload: { dataset: DatasetType; rows: RowData[] }): Promise<{ status: string; saved: number } & ApiResponse<unknown>> {
    const response = await fetch(`${API_BASE_URL}/ml/feature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ status: string; saved: number } & ApiResponse<unknown>>(response);
  },

  // Optionally fetch master CSV from backend if available
  async mlGetMasterCSV(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/ml/master.csv`, {
      headers: { Accept: 'text/csv' },
    });
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, response);
    }
    return response.text();
  },

  // Load feature CSVs from local folder on the backend (server reads d:/csv files)
  async mlLoadLocal(): Promise<{ status: string; loaded: Record<string, number>; total_feature_rows: number }> {
    const response = await fetch(`${API_BASE_URL}/ml/load-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<{ status: string; loaded: Record<string, number>; total_feature_rows: number }>(response);
  },
};

export { ApiError };
