import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { teamMembers } from '../../data/teamMockData';
import type { Machine, ProductionLine } from '../../types/models';
import type { TeamMember } from '../../types/team';
import { colors } from '../../theme/colors';
import { TeamAvatar, RoleBadge } from '../team/TeamIdentity';
import { ScalePressable } from '../ui/ScalePressable';

const STOP_COST_PER_MINUTE = 145;

type Props = {
  machine?: Machine | null;
  lines?: readonly (ProductionLine | null | undefined)[] | null;
  onReassign?: (machineId: string) => void;
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ActionButton({ label, icon, onPress, variant = 'secondary' }: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <ScalePressable
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.actionButton, variant === 'primary' ? styles.primaryAction : styles.secondaryAction]}
    >
      <Feather name={icon} size={14} color={variant === 'primary' ? colors.background : colors.textPrimary} />
      <Text style={[styles.actionText, variant === 'primary' && styles.primaryActionText]}>{label}</Text>
    </ScalePressable>
  );
}

export function ContingencyPanel({ machine, lines, onReassign }: Props) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [technicianSheetOpen, setTechnicianSheetOpen] = useState(false);
  const [assignedTechnician, setAssignedTechnician] = useState<TeamMember | null>(null);
  const [leadersNotified, setLeadersNotified] = useState(false);
  const previousStatus = useRef<Machine['status'] | null>(null);
  const previousMachineId = useRef<string | null>(null);
  const safeMachine = machine && typeof machine === 'object' ? machine : null;
  const machineId = safeMachine?.id ?? '';
  const machineName = safeMachine?.name ?? 'Máquina sem identificação';
  const machineStatus = safeMachine?.status ?? 'OFFLINE';
  const stopReason = safeMachine?.stops?.[0]?.reason ?? 'Parada não programada';
  const safeLines = (Array.isArray(lines) ? lines : []).filter(
    (line): line is ProductionLine => Boolean(line && typeof line.title === 'string')
  );
  const isStopped = machineStatus === 'PARADA';
  const accumulatedCost = STOP_COST_PER_MINUTE * elapsedSeconds / 60;
  const availableTechnicians = useMemo(
    () => teamMembers.filter((member) => member.role === 'TECNICO_MANUTENCAO' && member.availability !== 'ALLOCATED'),
    []
  );

  useEffect(() => {
    if (!isStopped) {
      setElapsedSeconds(0);
      setLeadersNotified(false);
      previousStatus.current = machine ? machineStatus : null;
      previousMachineId.current = machineId || null;
      return undefined;
    }

    const timer = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1_000);
    if (previousStatus.current !== 'PARADA' || previousMachineId.current !== machineId) {
      console.info('SIMULAÇÃO PUSH PRIORITÁRIA', {
        machine: machineName,
        fault: stopReason,
        recipients: ['Líder de manutenção', 'Líder de operação'],
      });
      setLeadersNotified(true);
    }
    previousStatus.current = machineStatus;
    previousMachineId.current = machineId || null;
    return () => clearInterval(timer);
  }, [isStopped, machineId, machineName, machineStatus, stopReason]);

  const assignTechnician = (technician: TeamMember) => {
    setAssignedTechnician(technician);
    setTechnicianSheetOpen(false);
    Alert.alert('Técnico alocado', `${technician.name ?? 'Técnico'} recebeu a OS ${machineId || 'sem identificador'}.`);
  };

  if (!safeMachine || !isStopped) return null;

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.criticalIcon}><Feather name="alert-triangle" size={15} color={colors.red} /></View>
        <View style={styles.headerCopy}>
          <Text style={styles.panelTitle}>Contingência ativa</Text>
          <Text style={styles.panelSubtitle}>{stopReason}</Text>
        </View>
        <View style={styles.liveChip}><View style={styles.liveDot} /><Text style={styles.liveText}>AO VIVO</Text></View>
      </View>

      <View style={styles.costBlock}>
        <Text style={styles.costLabel}>CUSTO ESTIMADO DA PARADA</Text>
        <View style={styles.costValues}>
          <Text style={styles.costTotal}>{formatCurrency(accumulatedCost)}</Text>
          <Text style={styles.costRate}>{formatCurrency(STOP_COST_PER_MINUTE)}/min</Text>
        </View>
        <Text style={styles.costCaption}>Acumulado desde o acionamento · {elapsedSeconds}s</Text>
      </View>

      {leadersNotified ? (
        <View style={styles.notificationRow}>
          <Feather name="radio" size={13} color={colors.purple} />
          <Text style={styles.notificationText}>Líderes de operação e manutenção notificados (simulação)</Text>
        </View>
      ) : null}

      {assignedTechnician ? (
        <View style={styles.assignmentRow}>
          <TeamAvatar name={assignedTechnician.name} initials={assignedTechnician.initials} size={30} />
          <View style={styles.assignmentCopy}>
            <Text style={styles.assignmentName}>{assignedTechnician.name}</Text>
            <Text style={styles.assignmentDetail}>Técnico designado para atendimento</Text>
          </View>
          <RoleBadge role={assignedTechnician.role} />
        </View>
      ) : null}

      <View style={styles.actions}>
        <ActionButton label={assignedTechnician ? 'Trocar técnico' : 'Alocar técnico'} icon="tool" onPress={() => setTechnicianSheetOpen(true)} variant="primary" />
        <ActionButton label="Realocar operadores" icon="shuffle" onPress={() => onReassign?.(safeMachine.id ?? '')} />
      </View>

      <View style={styles.planBlock}>
        <View style={styles.planHeader}><Feather name="calendar" size={13} color={colors.textMuted} /><Text style={styles.planTitle}>Plano de produção</Text></View>
        <Text style={styles.planModel}>Modelo atual · MTR-PX24</Text>
        <Text style={styles.planDetail}>{safeMachine.line ?? 'Linha sem identificação'} estava em produção contínua. Setup para MTR-PX26 previsto às 14:30.</Text>
        <Text style={styles.supportLine}>Linhas ativas para suporte: {safeLines.filter((line) => (Array.isArray(line.machines) ? line.machines : []).some((item) => item?.status === 'OPERANDO')).map((line) => line.title ?? '').filter(Boolean).map((title) => title.replace('Linha de ', '')).join(', ') || 'Nenhuma disponível'}</Text>
      </View>

      <Modal
        visible={technicianSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTechnicianSheetOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View><Text style={styles.sheetTitle}>Técnicos disponíveis</Text><Text style={styles.sheetSubtitle}>Turno A · atendimento de {machineId || 'sem identificador'}</Text></View>
              <ScalePressable onPress={() => setTechnicianSheetOpen(false)} style={styles.closeButton} accessibilityLabel="Fechar lista de técnicos">
                <Feather name="x" size={17} color={colors.textSecondary} />
              </ScalePressable>
            </View>
            <ScrollView>
              {availableTechnicians.map((technician) => (
                <ScalePressable key={technician.id} onPress={() => assignTechnician(technician)} style={styles.technicianRow}>
                  <TeamAvatar name={technician.name} initials={technician.initials} />
                  <View style={styles.technicianCopy}><Text style={styles.assignmentName}>{technician.name}</Text><Text style={styles.assignmentDetail}>{technician.skill}</Text></View>
                  <Feather name="arrow-up-right" size={15} color={colors.green} />
                </ScalePressable>
              ))}
              {availableTechnicians.length === 0 ? <Text style={styles.sheetSubtitle}>Sem técnicos disponíveis neste turno.</Text> : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderColor: '#63313D', borderRadius: 14, padding: 13, backgroundColor: '#1B1721', marginTop: 14 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  criticalIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#3B202B', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0 },
  panelTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  panelSubtitle: { color: colors.textSecondary, fontSize: 9, marginTop: 3 },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 7, backgroundColor: '#3B202B', paddingHorizontal: 7, paddingVertical: 5 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.red },
  liveText: { color: colors.red, fontSize: 8, fontWeight: '800' },
  costBlock: { marginTop: 13, padding: 11, borderRadius: 10, backgroundColor: '#11131B' },
  costLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  costValues: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 },
  costTotal: { color: colors.red, fontSize: 20, fontWeight: '800' },
  costRate: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  costCaption: { color: colors.textMuted, fontSize: 8, marginTop: 2 },
  notificationRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  notificationText: { flex: 1, color: colors.textSecondary, fontSize: 9 },
  assignmentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  assignmentCopy: { flex: 1, minWidth: 0 },
  assignmentName: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  assignmentDetail: { color: colors.textMuted, fontSize: 8, marginTop: 3 },
  actions: { gap: 7, marginTop: 12 },
  actionButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 10, paddingHorizontal: 10 },
  primaryAction: { backgroundColor: colors.green },
  secondaryAction: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  actionText: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  primaryActionText: { color: colors.background },
  planBlock: { marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planTitle: { color: colors.textSecondary, fontSize: 9, fontWeight: '700' },
  planModel: { color: colors.textPrimary, fontSize: 10, fontWeight: '700', marginTop: 7 },
  planDetail: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 4 },
  supportLine: { color: colors.green, fontSize: 8, marginTop: 6 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000099' },
  sheet: { maxHeight: '72%', borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.surface, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 28 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.surfaceBorder, alignSelf: 'center', marginBottom: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  sheetSubtitle: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  closeButton: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  technicianRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border },
  technicianCopy: { flex: 1 },
});