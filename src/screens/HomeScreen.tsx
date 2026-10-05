import { Feather } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { MachineCard } from '../components/MachineCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { machines, productionLines, statusSummary } from '../data/mockData';
import type { Machine } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

type Props = { onOpenMachine: (machineId: string) => void };

const chartData = statusSummary.map((item) => ({
  name: item.status,
  population: item.value,
  color: item.color,
  legendFontColor: colors.textSecondary,
  legendFontSize: 11,
}));

function LineGroup({ line, items, onPress }: { line: string; items: Machine[]; onPress: (id: string) => void }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <View style={styles.groupTitleRow}>
          <View style={styles.lineIndicator} />
          <Text style={styles.groupTitle}>{line}</Text>
        </View>
        <Text style={styles.count}>{String(items.length).padStart(2, '0')} EQUIP.</Text>
      </View>
      {items.map((machine) => (
        <MachineCard key={machine.id} machine={machine} onPress={onPress} />
      ))}
    </View>
  );
}

const LineGroupRow = memo(LineGroup);

export function HomeScreen({ onOpenMachine }: Props) {
  const { user, signOut } = useAuth();

  const renderLine: ListRenderItem<(typeof productionLines)[number]> = useCallback(
    ({ item }) => <LineGroupRow line={item.title} items={item.machines} onPress={onOpenMachine} />,
    [onOpenMachine],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.fixedHeader}>
        <ScreenHeader
          eyebrow="TERÇA-FEIRA · TURNO A"
          title={`Olá, ${user?.name || 'Operações'}`}
          right={
            <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
              <Feather name="log-out" size={16} color={colors.red} />
            </TouchableOpacity>
          }
        />
        <Text style={styles.subheading}>Visão geral da planta industrial</Text>
      </View>

      <FlatList
        data={productionLines}
        keyExtractor={(item) => item.title}
        renderItem={renderLine}
        ListHeaderComponent={
          <View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.cardEyebrow}>DISPONIBILIDADE DA PLANTA</Text>
                  <Text style={styles.summaryValue}>
                    92,4<Text style={styles.percent}>%</Text>
                  </Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Feather name="trending-up" size={13} color={colors.green} />
                  <Text style={styles.summaryBadgeText}>+2,4%</Text>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={styles.chartWrap}>
                  <PieChart
                    data={chartData}
                    width={166}
                    height={146}
                    chartConfig={{ color: () => colors.textSecondary }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="22"
                    hasLegend={false}
                    center={[0, 0]}
                    absolute={false}
                  />
                </View>
                <View style={styles.legend}>
                  {statusSummary.map((item) => (
                    <View key={item.status} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <View style={styles.legendCopy}>
                        <Text style={styles.legendLabel}>
                          {item.status === 'OPERANDO' ? 'Operando' : item.status === 'PARADA' ? 'Parada' : 'Manutenção'}
                        </Text>
                        <Text style={styles.legendCount}>{item.value}% da planta</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.summaryFooter}>
                <View style={styles.footerMetric}>
                  <Text style={styles.footerNumber}>{machines.length}</Text>
                  <Text style={styles.footerLabel}>equipamentos</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.footerMetric}>
                  <Text style={[styles.footerNumber, { color: colors.red }]}>
                    {String(machines.filter((machine) => machine.status === 'PARADA').length).padStart(2, '0')}
                  </Text>
                  <Text style={styles.footerLabel}>paradas ativas</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.footerMetric}>
                  <Text style={[styles.footerNumber, { color: colors.slate }]}>
                    {String(machines.filter((machine) => machine.status === 'OFFLINE').length).padStart(2, '0')}
                  </Text>
                  <Text style={styles.footerLabel}>offline</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Equipamentos</Text>
                <Text style={styles.sectionSub}>{machines.length} monitorados · atualização em tempo real</Text>
              </View>
              <View style={styles.filterButton}>
                <Feather name="sliders" size={16} color={colors.textSecondary} />
              </View>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  fixedHeader: { paddingTop: spacing.md, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.md },
  subheading: { ...typography.body, color: colors.textSecondary, marginTop: 5 },
  logoutButton: { padding: 8, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  listContent: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: 30 },
  summaryCard: { backgroundColor: colors.surface, borderRadius: spacing.radiusLg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.sm },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEyebrow: { ...typography.label, color: colors.textMuted, fontSize: 9, letterSpacing: 1 },
  summaryValue: { ...typography.hero, color: colors.textPrimary, fontSize: 32, marginTop: 5 },
  percent: { color: colors.textSecondary, fontSize: 18 },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: colors.greenBackground, borderRadius: spacing.pill },
  summaryBadgeText: { ...typography.label, color: colors.green, fontSize: 10 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  chartWrap: { width: 155, height: 143, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginLeft: -12 },
  legend: { flex: 1, gap: spacing.lg, paddingLeft: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legendDot: { width: 9, height: 9, borderRadius: 3 },
  legendCopy: { gap: 2 },
  legendLabel: { ...typography.label, color: colors.textPrimary },
  legendCount: { ...typography.label, color: colors.textMuted, fontWeight: '400', fontSize: 10 },
  summaryFooter: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  footerMetric: { alignItems: 'center', gap: 3 },
  footerNumber: { ...typography.subtitle, color: colors.textPrimary, fontSize: 15 },
  footerLabel: { ...typography.label, color: colors.textMuted, fontSize: 9, fontWeight: '500' },
  metricDivider: { height: 26, width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.section, marginBottom: spacing.lg },
  sectionTitle: { ...typography.title, color: colors.textPrimary, fontSize: 18 },
  sectionSub: { ...typography.label, color: colors.textMuted, fontWeight: '400', marginTop: 4 },
  filterButton: { height: 38, width: 38, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  group: { marginBottom: spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  lineIndicator: { width: 3, height: 15, borderRadius: 2, backgroundColor: colors.green },
  groupTitle: { ...typography.subtitle, color: colors.textPrimary, fontSize: 14 },
  count: { ...typography.label, color: colors.textMuted, fontSize: 9, letterSpacing: 0.7 },
});