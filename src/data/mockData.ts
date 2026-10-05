import type { Alert, Machine, MachineStatus } from '../types/models';

export const machines: Machine[] = [
  {
    id: 'MCH-1042', name: 'Prensa Hidráulica 04', line: 'Linha de Estamparia', sensorId: 'ESP32-AND-042',
    status: 'OPERANDO', location: 'Galpão A · Setor 04', lastSignal: 'há 2 s', uptimeToday: '97,8%', temperatureC: 42,
    stops: [
      { id: 's-1042-1', startedAt: 'Hoje, 09:42', duration: '4 min', reason: 'Ajuste de alimentação de chapa' },
      { id: 's-1042-2', startedAt: 'Ontem, 15:18', duration: '11 min', reason: 'Inspeção do sensor de segurança' },
      { id: 's-1042-3', startedAt: 'Ontem, 10:06', duration: '3 min', reason: 'Reposição de matéria-prima' },
    ],
  },
  {
    id: 'MCH-1043', name: 'Esteira de Alimentação 02', line: 'Linha de Estamparia', sensorId: 'ESP32-AND-043',
    status: 'PARADA', location: 'Galpão A · Setor 04', lastSignal: 'há 1 s', uptimeToday: '82,1%', temperatureC: 39,
    stops: [
      { id: 's-1043-1', startedAt: 'Hoje, 10:16', duration: 'Em andamento', reason: 'Falha detectada no motor de tração' },
      { id: 's-1043-2', startedAt: 'Hoje, 07:35', duration: '6 min', reason: 'Acúmulo de peças na saída' },
      { id: 's-1043-3', startedAt: 'Ontem, 16:02', duration: '8 min', reason: 'Rearme após parada de emergência' },
    ],
  },
  {
    id: 'MCH-2081', name: 'Robô de Solda 01', line: 'Linha de Montagem', sensorId: 'ESP32-AND-081',
    status: 'OPERANDO', location: 'Galpão B · Célula 01', lastSignal: 'há 3 s', uptimeToday: '99,2%', temperatureC: 46,
    stops: [
      { id: 's-2081-1', startedAt: 'Hoje, 08:12', duration: '2 min', reason: 'Troca programada de eletrodo' },
      { id: 's-2081-2', startedAt: 'Ontem, 14:34', duration: '5 min', reason: 'Calibração de trajetória' },
    ],
  },
  {
    id: 'MCH-2084', name: 'Estação de Fixação 03', line: 'Linha de Montagem', sensorId: 'ESP32-AND-084',
    status: 'MANUTENÇÃO', location: 'Galpão B · Célula 03', lastSignal: 'há 1 s', uptimeToday: '88,4%', temperatureC: 37,
    stops: [
      { id: 's-2084-1', startedAt: 'Hoje, 09:58', duration: 'Em andamento', reason: 'Manutenção preventiva do atuador' },
      { id: 's-2084-2', startedAt: 'Ontem, 11:22', duration: '7 min', reason: 'Verificação de pressão pneumática' },
    ],
  },
  {
    id: 'MCH-3090', name: 'Inspeção Óptica 02', line: 'Linha de Qualidade', sensorId: 'ESP32-AND-090',
    status: 'OPERANDO', location: 'Galpão C · Qualidade', lastSignal: 'há 4 s', uptimeToday: '98,6%', temperatureC: 34,
    stops: [{ id: 's-3090-1', startedAt: 'Hoje, 06:48', duration: '3 min', reason: 'Limpeza de lente programada' }],
  },
  {
    id: 'MCH-3092', name: 'Esteira de Rejeição 01', line: 'Linha de Qualidade', sensorId: 'ESP32-AND-092',
    status: 'OFFLINE', location: 'Galpão C · Qualidade', lastSignal: 'há 8 min', uptimeToday: '91,3%', temperatureC: 0,
    stops: [{ id: 's-3092-1', startedAt: 'Hoje, 10:09', duration: 'Em andamento', reason: 'Sem comunicação com o sensor ESP32' }],
  },
];

const connectedStatuses: MachineStatus[] = ['OPERANDO', 'PARADA', 'MANUTENÇÃO'];
const connectedMachines = machines.filter((machine) => machine.status !== 'OFFLINE');

export const statusSummary = connectedStatuses.map((status) => ({
  status,
  value: connectedMachines.length === 0 ? 0 : Math.round((connectedMachines.filter((machine) => machine.status === status).length / connectedMachines.length) * 100),
  color: status === 'OPERANDO' ? '#10B981' : status === 'PARADA' ? '#EF4444' : '#F59E0B',
}));

export const alerts: Alert[] = [
  {
    id: 'ALT-5821', machineId: 'MCH-1043', machineName: 'Esteira de Alimentação 02', line: 'Linha de Estamparia',
    severity: 'critical', title: 'Parada não programada', description: 'Motor de tração sem resposta. Linha interrompida.',
    occurredAt: 'Hoje, 10:16:32', technician: { name: 'Marcos Lima', initials: 'ML', role: 'Técnico de manutenção', color: '#2563EB' }, acknowledged: true,
  },
  {
    id: 'ALT-5819', machineId: 'MCH-2084', machineName: 'Estação de Fixação 03', line: 'Linha de Montagem',
    severity: 'warning', title: 'Manutenção preventiva iniciada', description: 'Atuador pneumático em inspeção programada.',
    occurredAt: 'Hoje, 09:58:04', technician: { name: 'Ana Costa', initials: 'AC', role: 'Líder de célula', color: '#7C3AED' }, acknowledged: true,
  },
  {
    id: 'ALT-5812', machineId: 'MCH-3092', machineName: 'Esteira de Rejeição 01', line: 'Linha de Qualidade',
    severity: 'warning', title: 'Sensor sem comunicação', description: 'Último heartbeat recebido há mais de 5 minutos.',
    occurredAt: 'Hoje, 10:09:17', technician: { name: 'João Ferreira', initials: 'JF', role: 'Automação industrial', color: '#0891B2' }, acknowledged: false,
  },
  {
    id: 'ALT-5788', machineId: 'MCH-1042', machineName: 'Prensa Hidráulica 04', line: 'Linha de Estamparia',
    severity: 'warning', title: 'Parada breve registrada', description: 'Ajuste de alimentação concluído em 4 minutos.',
    occurredAt: 'Hoje, 09:42:08', technician: { name: 'Marcos Lima', initials: 'ML', role: 'Técnico de manutenção', color: '#2563EB' }, acknowledged: true,
  },
  {
    id: 'ALT-5761', machineId: 'MCH-2081', machineName: 'Robô de Solda 01', line: 'Linha de Montagem',
    severity: 'warning', title: 'Ciclo de manutenção concluído', description: 'Troca de eletrodo realizada conforme plano.',
    occurredAt: 'Hoje, 08:14:22', technician: { name: 'Ana Costa', initials: 'AC', role: 'Líder de célula', color: '#7C3AED' }, acknowledged: true,
  },
];

export const productionLines = Array.from(new Set(machines.map((machine) => machine.line))).map((line) => ({
  title: line,
  machines: machines.filter((machine) => machine.line === line),
}));