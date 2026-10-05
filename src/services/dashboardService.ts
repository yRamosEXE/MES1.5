import { api } from './api';
import { alerts, dashboardSummary, machines, productionLines } from '../data/mockData';
import type { DashboardSummary, Machine, ProductionLine } from '../types/models';
import { withMockFallback } from './apiFallback';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const summary = await withMockFallback(
    () => api.get<DashboardSummary>('/dashboard/summary'),
    dashboardSummary,
    'Resumo do dashboard'
  );
  const candidate = summary && typeof summary === 'object' ? summary : dashboardSummary;

  return {
    ...dashboardSummary,
    ...candidate,
    indicators: candidate.indicators ?? dashboardSummary.indicators,
    machines: Array.isArray(candidate.machines) ? candidate.machines : dashboardSummary.machines,
    alerts: Array.isArray(candidate.alerts) ? candidate.alerts : dashboardSummary.alerts,
    lines: Array.isArray(candidate.lines) ? candidate.lines : dashboardSummary.lines,
    productionTrend: Array.isArray(candidate.productionTrend) ? candidate.productionTrend : dashboardSummary.productionTrend,
    activeOrders: Array.isArray(candidate.activeOrders) ? candidate.activeOrders : dashboardSummary.activeOrders,
    source: candidate === dashboardSummary ? 'mock' : 'live',
  };
}

export function getDashboardLines(): Promise<ProductionLine[]> {
  return withMockFallback(
    () => api.get<ProductionLine[]>('/dashboard/lines'),
    productionLines,
    'Linhas de produção'
  );
};

export function getMachineDetail(id: string | number): Promise<Machine> {
  const machine = machines.find((item) => item.id === String(id));
  const fallback = machine ?? { ...machines[0], id: String(id), name: `Máquina ${id}` };

  return withMockFallback(
    () => api.get<Machine>(`/dashboard/machines/${id}`),
    fallback,
    `Detalhes da máquina ${id}`
  );
};
