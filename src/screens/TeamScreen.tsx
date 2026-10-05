import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RoleBadge, TeamAvatar } from '../components/team/TeamIdentity';
import { ScalePressable } from '../components/ui/ScalePressable';
import { teamMembers } from '../data/teamMockData';
import { colors } from '../theme/colors';
import type { FactoryRole } from '../types/team';
import type { OperatorReallocation } from '../types/team';
import { FACTORY_ROLE_LABELS } from '../types/team';

type RoleFilter = 'TODOS' | FactoryRole;
const roleFilters: ReadonlyArray<{ value: RoleFilter; short: string }> = [
  { value: 'TODOS', short: 'Todos' },
  { value: 'OPERADOR', short: 'Operação' },
  { value: 'LIDER_OPERACAO', short: 'Líderes' },
  { value: 'TECNICO_MANUTENCAO', short: 'Técnicos' },
  { value: 'LIDER_MANUTENCAO', short: 'Manutenção' },
];

export function TeamScreen() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('TODOS');
  const [shift, setShift] = useState<'A' | 'B' | 'C'>('A');
  const [reallocations, setReallocations] = useState<OperatorReallocation[]>([]);
  const isFocused = useIsFocused();
  const members = useMemo(
    () => teamMembers.filter((member) => member.shift === shift && (roleFilter === 'TODOS' || member.role === roleFilter)),
    [roleFilter, shift]
  );
  const available = members.filter((member) => member.availability === 'AVAILABLE').length;

  useEffect(() => {
    if (!isFocused) return;
    let active = true;
    void AsyncStorage.getItem('@MES:operator_reallocations').then((raw) => {
      if (!active || !raw) return;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReallocations(parsed.filter((item): item is OperatorReallocation => Boolean(
            item && typeof item.memberId === 'string' && typeof item.toLine === 'string'
          )));
        }
      } catch (error: unknown) {
        console.info('Alocações locais ignoradas por formato inválido.', error);
      }
    }).catch((error: unknown) => console.info('Alocações offline indisponíveis.', error));
    return () => { active = false; };
  }, [isFocused]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
        <Text style={styles.eyebrow}>PESSOAS & ALOCAÇÃO</Text>
        <Text style={styles.title}>Equipe de fábrica</Text>
        <Text style={styles.subtitle}>{members.length} colaboradores · {available} disponíveis neste turno</Text>
      </Animated.View>

      <View style={styles.shiftRow}>
        <View style={styles.shiftCopy}><Text style={styles.shiftTitle}>Turno ativo</Text><Text style={styles.shiftHours}>06:00 — 14:00</Text></View>
        <View style={styles.shiftSwitch}>
          {(['A', 'B', 'C'] as const).map((item) => (
            <ScalePressable key={item} onPress={() => setShift(item)} style={[styles.shiftButton, shift === item && styles.shiftSelected]} accessibilityLabel={`Selecionar turno ${item}`}>
              <Text style={[styles.shiftLetter, shift === item && styles.shiftLetterSelected]}>{item}</Text>
            </ScalePressable>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {roleFilters.map((item) => {
          const selected = roleFilter === item.value;
          return (
            <ScalePressable key={item.value} onPress={() => setRoleFilter(item.value)} style={[styles.filter, selected && styles.filterSelected]} accessibilityLabel={`Filtrar equipe: ${item.short}`}>
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.short}</Text>
            </ScalePressable>
          );
        })}
      </ScrollView>

      <View style={styles.matrixHeading}><Text style={styles.matrixTitle}>Matriz de operadores</Text><Text style={styles.matrixCaption}>STATUS · FUNÇÃO · SETOR</Text></View>
      {members.map((member, index) => {
        const availabilityLabel = member.availability === 'AVAILABLE' ? 'Disponível' : member.availability === 'ON_CALL' ? 'Sobreaviso' : 'Alocado';
        const availabilityColor = member.availability === 'AVAILABLE' ? colors.green : member.availability === 'ON_CALL' ? colors.amber : colors.textMuted;
        const reallocation = reallocations.find((item) => item.memberId === member.id);
        return (
          <Animated.View key={member.id} entering={FadeInDown.delay(index * 75).duration(420)}>
            <ScalePressable
              onPress={() => Alert.alert(member.name, `${member.skill}\n${FACTORY_ROLE_LABELS[member.role]} · ${member.line}`)}
              style={styles.memberCard}
              accessibilityLabel={`Detalhes de ${member.name}`}
            >
              <TeamAvatar name={member.name} initials={member.initials} size={42} imageUri={member.avatarUri} />
              <View style={styles.memberCopy}>
                <View style={styles.nameRow}><Text numberOfLines={1} style={styles.memberName}>{member.name}</Text><View style={[styles.availabilityDot, { backgroundColor: availabilityColor }]} /></View>
                <RoleBadge role={member.role} />
                <View style={styles.memberMeta}><Feather name="layers" size={10} color={colors.textMuted} /><Text numberOfLines={1} style={styles.memberLine}>{reallocation ? `Temporário · ${reallocation.toLine}` : member.line}</Text><Text style={styles.availabilityText}>{reallocation ? 'Realocado' : availabilityLabel}</Text></View>
              </View>
              <Feather name="chevron-right" size={15} color={colors.textMuted} />
            </ScalePressable>
          </Animated.View>
        );
      })}
      {members.length === 0 ? <Text style={styles.empty}>Nenhum colaborador com esse papel no turno {shift}.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 34 },
  header: { paddingTop: 18, paddingBottom: 17 },
  eyebrow: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: colors.textPrimary, fontSize: 25, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  shiftRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  shiftCopy: { gap: 4 },
  shiftTitle: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  shiftHours: { color: colors.textMuted, fontSize: 9 },
  shiftSwitch: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: 9, backgroundColor: colors.background },
  shiftButton: { width: 27, height: 27, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  shiftSelected: { backgroundColor: colors.green },
  shiftLetter: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  shiftLetterSelected: { color: colors.background },
  filters: { gap: 7, paddingVertical: 14 },
  filter: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 8 },
  filterSelected: { borderColor: '#7C4DFF66', backgroundColor: '#7C4DFF18' },
  filterText: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  filterTextSelected: { color: colors.purple },
  matrixHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matrixTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  matrixCaption: { color: colors.textMuted, fontSize: 7, fontWeight: '700', letterSpacing: 0.5 },
  memberCard: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  memberCopy: { flex: 1, minWidth: 0, gap: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { flex: 1, color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  availabilityDot: { width: 6, height: 6, borderRadius: 3 },
  memberMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  memberLine: { flex: 1, color: colors.textMuted, fontSize: 8 },
  availabilityText: { color: colors.textSecondary, fontSize: 8 },
  empty: { color: colors.textMuted, fontSize: 10, paddingVertical: 20, textAlign: 'center' },
});