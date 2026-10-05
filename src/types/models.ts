import type { FactoryRole } from './team';

export type MachineStatus = 'OPERANDO' | 'PARADA' | 'MANUTENÇÃO' | 'OFFLINE';

export type ProductionIndicators = {
  oee: number;
  availability: number;
  performance: number;
  quality: number;
};

export type ProductionTrendPoint = {
  label: string;
  yield: number;
  quality: number;
  target: number;
};

export type ProductionOrderStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';

export type ProductionOrder = {
  code: string;
  line: string;
  operatorName: string;
  operatorInitials: string;
  operatorRole?: FactoryRole;
  progress: number;
  due: string;
  status: ProductionOrderStatus;
};

export type Machine = {
  id: string;
  name: string;
  line: string;
  sensorId: string;
  status: MachineStatus;
  location: string;
  lastSignal: string;
  uptimeToday: string;
  temperatureC: number;
  stops: MachineStop[];
};

export type MachineStop = {
  id: string;
  startedAt: string;
  duration: string;
  reason: string;
};

export type AlertSeverity = 'critical' | 'warning';

export type Alert = {
  id: string;
  machineId: string;
  machineName: string;
  line: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  occurredAt: string;
  technician: { name: string; initials: string; role: string; color: string };
  acknowledged: boolean;
};

export type ProductionLine = {
  title: string;
  machines: Machine[];
  operatorName?: string;
  operatorInitials?: string;
  operatorRole?: FactoryRole;
  efficiency?: number;
};

export type DashboardSummary = {
  indicators?: ProductionIndicators;
  source?: 'live' | 'mock';
  machines?: Machine[];
  alerts?: Alert[];
  lines?: ProductionLine[];
  productionTrend?: ProductionTrendPoint[];
  activeOrders?: ProductionOrder[];
};

export type Status = MachineStatus;