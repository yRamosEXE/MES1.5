export type MachineStatus = 'OPERANDO' | 'PARADA' | 'MANUTENÇÃO' | 'OFFLINE';

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

export type Status = MachineStatus;