import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useFleet, useKPIs, useAlerts } from './useApi';

// Mock server setup
const server = setupServer(
  http.get('/api/fleet', () => {
    return HttpResponse.json([
      {
        id: 'T01',
        depot: 'A',
        mileage_km: 125000,
        fitness_score: 0.92,
        available: true,
      },
    ]);
  }),
  http.get('/api/kpis', () => {
    return HttpResponse.json({
      punctuality: {
        on_time_percentage: 94.2,
        target_percentage: 95.0,
        trend: 'up',
      },
      maintenance_cost: {
        savings_estimate: 125000,
        target_savings: 150000,
        trend: 'stable',
      },
      transparency: {
        auto_explained_percentage: 87.5,
        target_percentage: 90.0,
        trend: 'up',
      },
      depot_utilization: {
        depot_a: 78.5,
        depot_b: 82.3,
        depot_c: 75.8,
        average: 78.9,
      },
    });
  }),
  http.get('/api/alerts', () => {
    return HttpResponse.json([
      {
        id: 'A01',
        train_id: 'T12',
        type: 'fitness_fail',
        severity: 'critical',
        timestamp: '2025-09-18T21:40:00Z',
        message: 'Test alert',
        resolved: false,
      },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('API Hooks', () => {
  describe('useFleet', () => {
    it('fetches fleet data successfully', async () => {
      const { result } = renderHook(() => useFleet(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([
        {
          id: 'T01',
          depot: 'A',
          mileage_km: 125000,
          fitness_score: 0.92,
          available: true,
        },
      ]);
    });

    it('handles loading state', () => {
      const { result } = renderHook(() => useFleet(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useKPIs', () => {
    it('fetches KPI data successfully', async () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.punctuality.on_time_percentage).toBe(94.2);
      expect(result.current.data?.maintenance_cost.savings_estimate).toBe(
        125000
      );
    });
  });

  describe('useAlerts', () => {
    it('fetches alerts data successfully', async () => {
      const { result } = renderHook(() => useAlerts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([
        {
          id: 'A01',
          train_id: 'T12',
          type: 'fitness_fail',
          severity: 'critical',
          timestamp: '2025-09-18T21:40:00Z',
          message: 'Test alert',
          resolved: false,
        },
      ]);
    });
  });
});
