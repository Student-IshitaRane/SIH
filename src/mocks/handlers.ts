import { http, HttpResponse } from 'msw';
import {
  mockTrainsets,
  mockMaintenanceJobs,
  mockAlerts,
  mockBrandingCampaigns,
  mockKPIMetrics,
  mockUsers,
} from '../data/mockData';
import { OptimizationRun, DecisionSnapshot, SimulationResult } from '../types';

// Mock optimization results
const mockOptimizationResults: OptimizationRun = {
  run_id: 'r123',
  date: '2025-09-18',
  ranked: [
    {
      id: 'T03',
      score: 0.91,
      confidence: 0.85,
      reasons: ['low-mileage', 'valid-fitness', 'depot balance ok'],
      conflicts: [],
      depot_balance_impact: 0.8,
      branding_priority: 8,
    },
    {
      id: 'T06',
      score: 0.89,
      confidence: 0.82,
      reasons: [
        'excellent-fitness',
        'recent-maintenance',
        'depot capacity available',
      ],
      conflicts: [],
      depot_balance_impact: 0.7,
      branding_priority: 0,
    },
    {
      id: 'T01',
      score: 0.87,
      confidence: 0.78,
      reasons: ['good-fitness', 'branding-campaign', 'depot balance ok'],
      conflicts: [],
      depot_balance_impact: 0.6,
      branding_priority: 8,
    },
    {
      id: 'T08',
      score: 0.85,
      confidence: 0.75,
      reasons: [
        'solid-fitness',
        'no-maintenance-flag',
        'depot capacity available',
      ],
      conflicts: [],
      depot_balance_impact: 0.5,
      branding_priority: 0,
    },
    {
      id: 'T15',
      score: 0.83,
      confidence: 0.72,
      reasons: ['good-fitness', 'branding-campaign', 'depot balance ok'],
      conflicts: [],
      depot_balance_impact: 0.4,
      branding_priority: 8,
    },
  ],
  meta: {
    execution_time_ms: 345,
    total_trains: 25,
    depot_balance: true,
    weighting: {
      reliability: 0.6,
      branding: 0.2,
      cost: 0.2,
    },
  },
};

// Mock decision snapshots
const mockDecisionSnapshots: DecisionSnapshot[] = [
  {
    snapshot_id: 's456',
    date: '2025-09-18T22:10:00Z',
    operator: 'supervisor1',
    run_id: 'r123',
    summary: {
      inducted: 6,
      standby: 15,
      maintenance: 4,
      rejected: 0,
    },
    decisions: [
      {
        id: 'T03',
        action: 'induct',
        operator: 'supervisor1',
        note: 'Approved - good fitness and depot balance',
        timestamp: '2025-09-18T22:10:00Z',
      },
      {
        id: 'T06',
        action: 'induct',
        operator: 'supervisor1',
        note: 'Approved - excellent condition',
        timestamp: '2025-09-18T22:10:00Z',
      },
      {
        id: 'T01',
        action: 'induct',
        operator: 'supervisor1',
        note: 'Approved - branding campaign active',
        timestamp: '2025-09-18T22:10:00Z',
      },
    ],
    reasons: [
      { id: 'T03', why: ['fitness ok', 'branding high'], action: 'induct' },
      {
        id: 'T06',
        why: ['fitness excellent', 'recent maintenance'],
        action: 'induct',
      },
      {
        id: 'T01',
        why: ['fitness good', 'branding campaign'],
        action: 'induct',
      },
    ],
  },
];

export const handlers = [
  // Fleet endpoints
  http.get('/api/fleet', () => {
    return HttpResponse.json(mockTrainsets);
  }),

  // Optimization endpoints
  http.post('/api/optimize', async ({ request }) => {
    const body = await request.json();
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return HttpResponse.json(mockOptimizationResults);
  }),

  // Decision endpoints
  http.post('/api/decisions', async ({ request }) => {
    const body = await request.json();
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return HttpResponse.json({
      status: 'ok',
      snapshot_id: 's456',
      message: 'Decisions saved and published successfully',
    });
  }),

  // History endpoints
  http.get('/api/history', () => {
    return HttpResponse.json(mockDecisionSnapshots);
  }),

  // Maintenance endpoints
  http.get('/api/maintenance', () => {
    return HttpResponse.json(mockMaintenanceJobs);
  }),

  // Alerts endpoints
  http.get('/api/alerts', () => {
    return HttpResponse.json(mockAlerts);
  }),

  // Branding campaigns endpoints
  http.get('/api/branding-campaigns', () => {
    return HttpResponse.json(mockBrandingCampaigns);
  }),

  // KPI endpoints
  http.get('/api/kpis', () => {
    return HttpResponse.json(mockKPIMetrics);
  }),

  // Simulation endpoints
  http.post('/api/simulate', async ({ request }) => {
    const body = await request.json();
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockSimulationResult: SimulationResult = {
      baseline: {
        inducted: 6,
        punctuality: 94.2,
        cost_savings: 125000,
      },
      simulation: {
        inducted: 4,
        punctuality: 91.8,
        cost_savings: 98000,
      },
      delta: {
        inducted: -2,
        punctuality: -2.4,
        cost_savings: -27000,
      },
      recommendations: [
        'Consider reopening Depot A to maintain service levels',
        'Alternative: Increase utilization of remaining depots',
        'Monitor fitness scores closely during this period',
      ],
    };

    return HttpResponse.json(mockSimulationResult);
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    // Mock authentication
    if (body.username === 'supervisor1' && body.password === 'password') {
      return HttpResponse.json({
        user: mockUsers[0],
        token: 'mock-jwt-token-123',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(mockUsers[0]);
  }),

  // Export endpoints
  http.post('/api/export/csv', async ({ request }) => {
    const body = await request.json();
    // Simulate file generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return HttpResponse.json({
      download_url: '/api/downloads/export-2025-09-18.csv',
      filename: 'induction-plan-2025-09-18.csv',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  }),

  http.post('/api/export/pdf', async ({ request }) => {
    const body = await request.json();
    // Simulate file generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return HttpResponse.json({
      download_url: '/api/downloads/report-2025-09-18.pdf',
      filename: 'induction-report-2025-09-18.pdf',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  }),
];
