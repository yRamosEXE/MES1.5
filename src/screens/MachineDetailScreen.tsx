import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBadge, StatusIcon } from '../components/StatusBadge';
import { machines } from '../data/mockData';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Machine } from '../types/models';

type Props = { machineId: string };

function Metadata({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return <View style={styles.metadata}><View style={styles.metadataIcon}><Feather name={icon} size={15} color={colors.textSecondary} /></View><View style={styles.metadataCopy}><Text style={styles.metadataLabel}>{label}</Text><Text style={styles.metadataValue}>{value}</Text></View></View>;
}

export function MachineDetailScreen({ machineId }: Props) {
  const machine: Machine | undefined = machines.find((item) => item.id === machineId);
  if (!machine) {
    return <View style={styles.notFound}><Feather name="alert-circle" size={26} color={colors.amber} /><Text style={styles.notFoundTitle}>Equipamento não encontrado</Text><Text style={styles.notFoundCopy}>Verifique o identificador e tente novamente.</Text></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.machineHero}>
        <View style={styles.heroIcon}><Feather name="settings" size={22} color={colors.green} /></View>
        <Text style={styles.eyebrow}>{machine.id} · {machine.line}</Text>
        <Text style={styles.title}>{machine.name}</Text>
        <View style={styles.statusLine}><StatusBadge status={machine.status} /><View style={styles.updated}><View style={styles.onlineDot} /><Text style={styles.updatedText}>Sinal {machine.lastSignal}</Text></View></View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Dados do equipamento</Text>
        <View style={styles.metadataGrid}>
          <Metadata icon="layers" label="Linha de produção" value={machine.line} />
          <Metadata icon="cpu" label="Sensor Andon" value={machine.sensorId} />
          <Metadata icon="map-pin" label="Localização" value={machine.location} />
          <Metadata icon="clock" label="Disponibilidade hoje" value={machine.uptimeToday} />
        </View>
      </View>

      <View style={styles.communicationCard}>
        <View style={styles.communicationHead}><View style={styles.commIcon}><StatusIcon status={machine.status} size={18} /></View><View style={styles.commCopy}><Text style={styles.cardTitle}>Comunicação</Text><Text style={styles.commSubtitle}>ESP32 · última telemetria</Text></View><View style={styles.connected}><View style={[styles.onlineDot, machine.status === 'OFFLINE' && styles.offlineDot]} /><Text style={[styles.connectedText, machine.status === 'OFFLINE' && { color: colors.slate }]}>{machine.status === 'OFFLINE' ? 'OFFLINE' : 'CONECTADO'}</Text></View></View>
        <View style={styles.commDivider} />
        <View style={styles.commStats}><View><Text style={styles.metadataLabel}>Heartbeat</Text><Text style={styles.commValue}>{machine.lastSignal}</Text></View><View><Text style={styles.metadataLabel}>Temperatura</Text><Text style={styles.commValue}>{machine.temperatureC ? `${machine.temperatureC}°C` : '—'}</Text></View><View><Text style={styles.metadataLabel}>Protocolo</Text><Text style={styles.commValue}>Wi-Fi · MQTT</Text></View></View>
      </View>

      <View style={styles.historyHeading}><View><Text style={styles.cardTitle}>Histórico de paradas</Text><Text style={styles.historySub}>Eventos recentes deste equipamento</Text></View><View style={styles.historyIcon}><Feather name="clock" size={15} color={colors.textSecondary} /></View></View>
      <View style={styles.historyCard}>
        {machine.stops.map((stop, index) => (
          <View key={stop.id} style={[styles.stopRow, index === machine.stops.length - 1 && styles.stopLast]}>
            <View style={styles.timeline}><View style={[styles.timelineDot, stop.duration === 'Em andamento' && { backgroundColor: colors.red }]} />{index !== machine.stops.length - 1 && <View style={styles.timelineLine} />}</View>
            <View style={styles.stopCopy}><View style={styles.stopTop}><Text style={styles.stopDate}>{stop.startedAt}</Text><Text style={[styles.stopDuration, stop.duration === 'Em andamento' && { color: colors.red }]}>{stop.duration}</Text></View><Text style={styles.stopReason}>{stop.reason}</Text></View>
          </View>
        ))}
      </View>
      <View style={styles.footerNote}><Feather name="shield" size={14} color={colors.textMuted} /><Text style={styles.footerNoteText}>Monitoramento passivo · dados recebidos do ESP32</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xl, paddingBottom: 34 },
  machineHero: { alignItems: 'flex-start', paddingBottom: spacing.xl },
  heroIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenBackground, marginBottom: spacing.lg },
  eyebrow: { ...typography.label, color: colors.textMuted, letterSpacing: 0.7, marginBottom: 7 },
  title: { ...typography.hero, color: colors.textPrimary, fontSize: 25 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  updated: { flexDirection: 'row', alignItems: 'center' },
  updatedText: { ...typography.label, color: colors.textSecondary, fontWeight: '400' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green, marginRight: 4 },
  sectionCard: { backgroundColor: colors.surface, borderRadius: spacing.radius, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { ...typography.subtitle, color: colors.textPrimary },
  metadataGrid: { marginTop: spacing.lg, gap: spacing.lg },
  metadata: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metadataIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  metadataCopy: { flex: 1, gap: 2 },
  metadataLabel: { ...typography.label, color: colors.textMuted, fontWeight: '400', fontSize: 10 },
  metadataValue: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  communicationCard: { backgroundColor: colors.surface, borderRadius: spacing.radius, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.section },
  communicationHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  commIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  commCopy: { flex: 1 },
  commSubtitle: { ...typography.label, color: colors.textMuted, fontWeight: '400', marginTop: 2, fontSize: 10 },
  connected: { flexDirection: 'row', alignItems: 'center' },
  connectedText: { ...typography.label, color: colors.green, fontSize: 9, letterSpacing: 0.4 },
  offlineDot: { backgroundColor: colors.slate },
  commDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.lg },
  commStats: { flexDirection: 'row', justifyContent: 'space-between' },
  commValue: { ...typography.label, color: colors.textPrimary, marginTop: 5 },
  historyHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  historySub: { ...typography.label, color: colors.textMuted, fontWeight: '400', marginTop: 4 },
  historyIcon: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  historyCard: { backgroundColor: colors.surface, borderRadius: spacing.radius, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  stopRow: { minHeight: 70, flexDirection: 'row', gap: spacing.md },
  stopLast: { minHeight: 60 },
  timeline: { alignItems: 'center', width: 12 },
  timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.textMuted, marginTop: 4 },
  timelineLine: { width: 1, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  stopCopy: { flex: 1, paddingBottom: spacing.lg },
  stopTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  stopDate: { ...typography.label, color: colors.textPrimary },
  stopDuration: { ...typography.label, color: colors.textSecondary, fontSize: 10 },
  stopReason: { ...typography.body, color: colors.textSecondary, marginTop: 5 },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: spacing.xl },
  footerNoteText: { ...typography.label, color: colors.textMuted, fontSize: 10, fontWeight: '400' },
  notFound: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  notFoundTitle: { ...typography.subtitle, color: colors.textPrimary, marginTop: spacing.lg },
  notFoundCopy: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});