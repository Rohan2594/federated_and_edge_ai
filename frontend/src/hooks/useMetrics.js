import { useCallback } from "react";
import { api, MOCK } from "../api/client";
import { usePolling } from "./usePolling";

export function useMetrics(intervalMs = 8000) {
  const fn = useCallback(() => api.metrics(), []);
  return usePolling(fn, MOCK.metrics, intervalMs);
}

export function useClients(intervalMs = 10000) {
  const fn = useCallback(() => api.clients(), []);
  return usePolling(fn, MOCK.clients, intervalMs);
}

export function useSecurity(intervalMs = 10000) {
  const fn = useCallback(() => api.security(), []);
  return usePolling(fn, MOCK.security, intervalMs);
}

export function useCommunication(intervalMs = 15000) {
  const fn = useCallback(() => api.communication(), []);
  return usePolling(fn, MOCK.communication, intervalMs);
}

export function useVisualizations(intervalMs = 30000) {
  const fn = useCallback(() => api.visualizations(), []);
  return usePolling(fn, MOCK.visualizations, intervalMs);
}
