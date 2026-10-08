import { api } from './api';
import { alerts } from '../data/mockData';
import type { Alert } from '../types/models';
import { withMockFallback } from './apiFallback';

export function getLatestAlerts(): Promise<Alert[]> {
  return withMockFallback(
    () => api.get<Alert[]>('/alerts/feed/latest'),
    alerts,
    'Alertas recentes'
  );
};

export function getAllAlerts(page = 1, limit = 10): Promise<Alert[]> {
  return withMockFallback(
    () => api.get<Alert[]>('/alerts', { params: { page, limit } }),
    alerts.slice((page - 1) * limit, page * limit),
    'Lista de alertas'
  );
};
