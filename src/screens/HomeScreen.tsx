import React, { useCallback, useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExecutiveHeader } from '../components/dashboard/ExecutiveHeader';
import { AlertPreviewCard } from '../components/dashboard/AlertPreviewCard';
import { MetricCard } from '../components/dashboard/MetricCard';
import { OpTracker } from '../components/dashboard/OpTracker';
import { ProductionLineCard } from '../components/dashboard/ProductionLineCard';
import { ProductionTrendChart } from '../components/dashboard/ProductionTrendChart';
import { StatusDonut } from '../components/dashboard/StatusDonut';
import { MachineCard } from '../components/MachineCard';
import { dashboardSummary } from '../data/mockData';
import { getDashboardSummary } from '../services/dashboardService';
import { colors } from '../theme/colors';
import type { Alert, DashboardSummary, Machine, ProductionLine, ProductionOrder, ProductionTrendPoint } from '../types/models';

const CACHE_KEY = '@MES:dashboard_cache';
const REFRESH_INTERVAL = 30_000;

type Props = { onOpenMachine?: (machineId: string) => void; onOpenProfile?: () => void };

function formatUpdateTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function SectionTitle({ title, detail, icon }: { title: string; detail?: string; icon: keyof typeof Feather.glyphMap }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}><Feather name={icon} size={14} color={colors.textSecondary} /></View>
      <View style={styles.sectionTitleCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
      </View>
      <Feather name="more-horizontal" size={18} color={colors.textMuted} />
    </View>
  );
}

export const HomeScreen = ({ onOpenMachine, onOpenProfile }: Props) => {
  const [dashboard, setDashboard] = useState<DashboardSummary>(dashboardSummary);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await getDashboardSummary();
      const safeSummary: DashboardSummary = {
        ...dashboardSummary,
        ...result,
        indicators: result.indicators ?? dashboardSummary.indicators,
        machines: Array.isArray(result.machines) ? result.machines : dashboardSummary.machines,
        alerts: Array.isArray(result.alerts) ? result.alerts : dashboardSummary.alerts,
        lines: Array.isArray(result.lines) ? result.lines : dashboardSummary.lines,
        productionTrend: Array.isArray(result.productionTrend) ? result.productionTrend : dashboardSummary.productionTrend,
        activeOrders: Array.isArray(result.activeOrders) ? result.activeOrders : dashboardSummary.activeOrders,
      };
      setDashboard(safeSummary);
      setLastUpdated(new Date());
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(safeSummary.machines));
      } catch (storageError: unknown) {
        console.info('Cache do dashboard indisponível neste ambiente.', storageError);
      }
    } catch (error: unknown) {
      console.info('Usando o último snapshot do dashboard.', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
    const interval = setInterval(() => void loadDashboardData(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const machines: readonly Machine[] = (Array.isArray(dashboard.machines) ? dashboard.machines : []).filter(
    (machine): machine is Machine => Boolean(machine && typeof machine.id === 'string')
  );
  const indicators = dashboard.indicators ?? dashboardSummary.indicators;
  const alerts: Alert[] = (Array.isArray(dashboard.alerts) ? dashboard.alerts : []).filter(
    (alert): alert is Alert => Boolean(alert && typeof alert.id === 'string')
  ).slice(0, 3);
  const lines: ProductionLine[] = (Array.isArray(dashboard.lines) ? dashboard.lines : []).filter(
    (line): line is ProductionLine => Boolean(line && typeof line.title === 'string')
  );
  const trend: ProductionTrendPoint[] = (Array.isArray(dashboard.productionTrend) ? dashboard.productionTrend : []).filter(
    (point): point is ProductionTrendPoint => Boolean(point && typeof point.label === 'string')
  );
  const orders: ProductionOrder[] = (Array.isArray(dashboard.activeOrders) ? dashboard.activeOrders : []).filter(
    (order): order is ProductionOrder => Boolean(order && typeof order.code === 'string')
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ExecutiveHeader
        lastUpdated={formatUpdateTime(lastUpdated)}
        source={dashboard.source ?? 'mock'}
        refreshing={refreshing}
        onRefresh={() => void loadDashboardData()}
        onOpenProfile={onOpenProfile}
      />

      <View style={styles.section}>
        <SectionTitle title="Indicadores-chave" detail="Desempenho do turno atual" icon="trending-up" />
        <View style={styles.metricGrid}>
          <MetricCard label="OEE" value={indicators?.oee ?? 0} icon="pie-chart" accent={colors.green} delay={60} helper="+4,2% turno" />
          <MetricCard label="Disponibilidade" value={indicators?.availability ?? 0} icon="zap" accent={colors.purple} delay={120} helper="meta 95%" />
          <MetricCard label="Performance" value={indicators?.performance ?? 0} icon="activity" accent={colors.amber} delay={180} helper="+1,8% turno" />
          <MetricCard label="Qualidade" value={indicators?.quality ?? 0} icon="check-circle" accent={colors.green} delay={240} helper="meta 98%" />
        </View>
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Status das máquinas" detail={`${machines.length} ativos monitorados`} icon="cpu" />
        <StatusDonut machines={machines} />
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Tendência de produção" detail="Rendimento, qualidade e meta · hoje" icon="bar-chart-2" />
        <ProductionTrendChart points={trend} />
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Eficiência por linha" detail="Operadores e saúde do setor" icon="layers" />
        {lines.map((line, index) => <ProductionLineCard key={line.title} line={line} index={index} />)}
        {lines.length === 0 ? <Text style={styles.emptyText}>Nenhuma linha disponível.</Text> : null}
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Ordens em execução" detail={`${orders.length} ordens no turno`} icon="clipboard" />
        <OpTracker orders={orders} />
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Alertas recentes" detail="Últimas ocorrências" icon="bell" />
        {alerts.map((alert, index) => (
          <AlertPreviewCard key={alert.id} alert={alert} index={index} onPress={onOpenMachine ?? (() => undefined)} />
        ))}
        {alerts.length === 0 ? <Text style={styles.emptyText}>Sem alertas recentes.</Text> : null}
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Parque de máquinas" detail="Acesso rápido aos equipamentos" icon="settings" />
        {machines.map((machine, index) => (
          <MachineCard key={machine.id} machine={machine} onPress={onOpenMachine ?? (() => undefined)} index={index} />
        ))}
        {machines.length === 0 ? <Text style={styles.emptyText}>Nenhuma máquina encontrada.</Text> : null}
      </View>
      <Text style={styles.footer}>MES CONTROL · MONITORAMENTO INDUSTRIAL</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 36 },
  section: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  sectionIcon: { width: 27, height: 27, borderRadius: 8, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  sectionTitleCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  sectionDetail: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  panel: { marginHorizontal: 16, marginBottom: 12, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface },
  emptyText: { color: colors.textMuted, fontSize: 11, paddingVertical: 12 },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: 8, fontWeight: '700', letterSpacing: 1, paddingVertical: 14 },
});