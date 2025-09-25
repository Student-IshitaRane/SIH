import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
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
} from '../types';

// Query keys
export const queryKeys = {
  fleet: ['fleet'] as const,
  maintenance: ['maintenance'] as const,
  alerts: ['alerts'] as const,
  brandingCampaigns: ['branding-campaigns'] as const,
  kpis: ['kpis'] as const,
  history: ['history'] as const,
  currentUser: ['current-user'] as const,
};

// Fleet hooks
export const useFleet = () => {
  return useQuery({
    queryKey: queryKeys.fleet,
    queryFn: api.getFleet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Optimization hooks
export const useOptimize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.optimize,
    onSuccess: (data) => {
      // Cache the optimization result
      queryClient.setQueryData(['optimization', data.run_id], data);
    },
  });
};

// Decision hooks
export const useSaveDecisions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.saveDecisions,
    onSuccess: () => {
      // Invalidate and refetch history
      queryClient.invalidateQueries({ queryKey: queryKeys.history });
      // Invalidate KPIs as they might change
      queryClient.invalidateQueries({ queryKey: queryKeys.kpis });
    },
  });
};

// Maintenance hooks
export const useMaintenance = () => {
  return useQuery({
    queryKey: queryKeys.maintenance,
    queryFn: api.getMaintenance,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Alerts hooks
export const useAlerts = () => {
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: api.getAlerts,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

// Branding campaigns hooks
export const useBrandingCampaigns = () => {
  return useQuery({
    queryKey: queryKeys.brandingCampaigns,
    queryFn: api.getBrandingCampaigns,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// KPI hooks
export const useKPIs = () => {
  return useQuery({
    queryKey: queryKeys.kpis,
    queryFn: api.getKPIs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// History hooks
export const useHistory = () => {
  return useQuery({
    queryKey: queryKeys.history,
    queryFn: api.getHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Simulation hooks
export const useSimulate = () => {
  return useMutation({
    mutationFn: api.simulate,
  });
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(queryKeys.currentUser, data.user);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: api.getCurrentUser,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  });
};

// Export hooks
export const useExportCSV = () => {
  return useMutation({
    mutationFn: api.exportCSV,
  });
};

export const useExportPDF = () => {
  return useMutation({
    mutationFn: api.exportPDF,
  });
};
