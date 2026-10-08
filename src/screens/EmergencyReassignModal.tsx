import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RoleBadge, TeamAvatar } from '../components/team/TeamIdentity';
import { ScalePressable } from '../components/ui/ScalePressable';
import { machines, productionLines } from '../data/mockData';
import { teamMembers } from '../data/teamMockData';
import { colors } from '../theme/colors';
import type { Machine, ProductionLine } from '../types/models';
import type { OperatorReallocation } from '../types/team';
import type { RootStackParamList } from '../navigation/navigationTypes';

const REALLOCATION_KEY = '@MES:operator_reallocations';
type Props = NativeStackScreenProps<RootStackParamList, 'EmergencyReassignModal'>;

function activeLines(lines: readonly ProductionLine[], pausedLine: string): ProductionLine[] {
  return lines.filter((line) => line.title !== pausedLine && line.machines.some((machine) => machine.status === 'OPERANDO'));
}

export function EmergencyReassignModal({ navigation, route }: Props) {
  const machineId = route.params.machineId;
  const machine: Machine | undefined = machines.find((item) => item.id === machineId);
  const sourceLine = machine?.line ?? 'Linha indisponível';
  const [targetLine, setTargetLine] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const affectedOperators = useMemo(
    () => teamMembers.filter((member) => member.line === sourceLine && (member.role === 'OPERADOR' || member.role === 'LIDER_OPERACAO')),
    [sourceLine]
  );
  const destinations = activeLines(productionLines, sourceLine);

  const confirmReallocation = async () => {
    if (!targetLine || affectedOperators.length === 0 || saving) return;
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(REALLOCATION_KEY);
      const existing: OperatorReallocation[] = raw ? JSON.parse(raw) as OperatorReallocation[] : [];
      const startedAt = new Date().toISOString();
      const next: OperatorReallocation[] = [
        ...existing.filter((item) => !affectedOperators.some((member) => member.id === item.memberId)),
        ...affectedOperators.map((member) => ({
          memberId: member.id,
          fromLine: sourceLine,
          toLine: targetLine,
          startedAt,
          temporary: true as const,
        })),
      ];
      await AsyncStorage.setItem(REALLOCATION_KEY, JSON.stringify(next));
      Alert.alert('Equipe realocada', `${affectedOperators.length} colaborador(es) movidos temporariamente para ${targetLine}.`);
      navigation.goBack();
    } catch (error: unknown) {
      console.info('Não foi possível persistir a realocação offline.', error);
      Alert.alert('Não foi possível salvar', 'A realocação não foi aplicada porque o armazenamento local está indisponível.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <ScalePressable onPress={() => navigation.goBack()} style={styles.backdropHit} accessibilityLabel="Fechar realocação" />
      <Animated.View entering={FadeInDown.duration(300)} style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>PLANO B · CONTINGÊNCIA</Text><Text style={styles.title}>Realocar operadores</Text></View>
          <ScalePressable onPress={() => navigation.goBack()} style={styles.closeButton} accessibilityLabel="Fechar"><Feather name="x" size={17} color={colors.textSecondary} /></ScalePressable>
        </View>
        <Text style={styles.context}>Equipe de {sourceLine} · parada {machine?.id ?? machineId}</Text>

        <Text style={styles.sectionTitle}>Colaboradores afetados</Text>
        <View style={styles.operatorList}>
          {affectedOperators.map((member) => <View key={member.id} style={styles.operatorRow}><TeamAvatar name={member.name} initials={member.initials} size={34} /><View style={styles.operatorCopy}><Text style={styles.operatorName}>{member.name}</Text><RoleBadge role={member.role} /></View></View>)}
          {affectedOperators.length === 0 ? <Text style={styles.muted}>Nenhum operador vinculado a esta linha no mock.</Text> : null}
        </View>

        <Text style={[styles.sectionTitle, styles.destinationHeading]}>Linha de suporte</Text>
        <ScrollView style={styles.destinations}>
          {destinations.map((line) => {
            const selected = targetLine === line.title;
            return (
              <ScalePressable key={line.title} onPress={() => setTargetLine(line.title)} style={[styles.destination, selected && styles.destinationSelected]} accessibilityLabel={`Selecionar ${line.title}`}>
                <View style={styles.destinationIcon}><Feather name="activity" size={14} color={colors.green} /></View>
                <View style={styles.destinationCopy}><Text style={styles.destinationName}>{line.title}</Text><Text style={styles.muted}>{line.machines.filter((item) => item.status === 'OPERANDO').length} máquinas operando</Text></View>
                {selected ? <Feather name="check-circle" size={17} color={colors.green} /> : null}
              </ScalePressable>
            );
          })}
          {destinations.length === 0 ? <Text style={styles.muted}>Nenhuma linha ativa disponível para receber a equipe.</Text> : null}
        </ScrollView>

        <View style={styles.planBox}>
          <Feather name="calendar" size={13} color={colors.amber} />
          <Text style={styles.planText}>Plano: {machine?.line ?? 'Linha'} produz o modelo MTR-PX24. Setup MTR-PX26 previsto às 14:30.</Text>
        </View>

        <ScalePressable onPress={() => void confirmReallocation()} disabled={!targetLine || saving || affectedOperators.length === 0} style={[styles.confirmButton, (!targetLine || saving || affectedOperators.length === 0) && styles.confirmDisabled]} accessibilityLabel="Confirmar realocação de operadores">
          <Feather name="shuffle" size={14} color={colors.background} /><Text style={styles.confirmText}>{saving ? 'Aplicando...' : 'Realocar temporariamente'}</Text>
        </ScalePressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' },
  backdropHit: StyleSheet.absoluteFill,
  sheet: { maxHeight: '92%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 28 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.surfaceBorder, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.amber, fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 4 },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.surface },
  context: { color: colors.textSecondary, fontSize: 10, marginTop: 7 },
  sectionTitle: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.6, marginTop: 18, marginBottom: 8 },
  operatorList: { gap: 7 },
  operatorRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  operatorCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  operatorName: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  destinationHeading: { marginTop: 16 },
  destinations: { maxHeight: 170 },
  destination: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6, paddingHorizontal: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.surface },
  destinationSelected: { borderColor: colors.green, backgroundColor: '#00E67612' },
  destinationIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#00E67615' },
  destinationCopy: { flex: 1 },
  destinationName: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 8, marginTop: 3 },
  planBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#FFB30012' },
  planText: { flex: 1, color: colors.textSecondary, fontSize: 9, lineHeight: 14 },
  confirmButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 11, backgroundColor: colors.green, marginTop: 13 },
  confirmDisabled: { opacity: 0.42 },
  confirmText: { color: colors.background, fontSize: 10, fontWeight: '800' },
});