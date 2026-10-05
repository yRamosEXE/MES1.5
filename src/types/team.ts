export type FactoryRole =
  | 'OPERADOR'
  | 'LIDER_OPERACAO'
  | 'TECNICO_MANUTENCAO'
  | 'LIDER_MANUTENCAO';

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  role: FactoryRole;
  line: string;
  shift: 'A' | 'B' | 'C';
  availability: 'AVAILABLE' | 'ALLOCATED' | 'ON_CALL';
  skill: string;
  avatarUri?: string;
};

export type OperatorReallocation = {
  memberId: string;
  fromLine: string;
  toLine: string;
  startedAt: string;
  temporary: true;
};

export const FACTORY_ROLE_LABELS: Record<FactoryRole, string> = {
  OPERADOR: 'Operador',
  LIDER_OPERACAO: 'Líder de operação',
  TECNICO_MANUTENCAO: 'Técnico de manutenção',
  LIDER_MANUTENCAO: 'Líder de manutenção',
};