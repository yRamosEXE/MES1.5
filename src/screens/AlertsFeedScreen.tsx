import { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCard } from '../components/AlertCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { alerts } from '../data/mockData';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Alert } from '../types/models';

type Props = { onOpenMachine: (machineId: string) => void };

export function AlertsFeedScreen({ onOpenMachine }: Props) {
  const renderItem: ListRenderItem<Alert> = useCallback(({ item }) => <AlertCard alert={item} onPress={onOpenMachine} />, [onOpenMachine]);
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}><ScreenHeader eyebrow="CENTRO DE EVENTOS" title="Alertas" right={<View style={styles.unread}><Text style={styles.unreadText}>03</Text></View>} /><Text style={styles.subheading}>Anomalias e intervenções recentes</Text></View>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View style={styles.feedInfo}><View style={styles.liveIndicator} /><Text style={styles.feedInfoText}>ATUALIZADO AGORA</Text><Text style={styles.today}>HOJE · 5 EVENTOS</Text></View>}
        initialNumToRender={5}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.md, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.lg },
  subheading: { ...typography.body, color: colors.textSecondary, marginTop: 5 },
  unread: { width: 37, height: 37, borderRadius: 12, backgroundColor: colors.redBackground, alignItems: 'center', justifyContent: 'center' },
  unreadText: { ...typography.label, color: colors.red },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: 30 },
  feedInfo: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: spacing.lg, paddingTop: spacing.sm },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  feedInfoText: { ...typography.label, color: colors.green, fontSize: 9, letterSpacing: 0.6, flex: 1 },
  today: { ...typography.label, color: colors.textMuted, fontSize: 9, letterSpacing: 0.6 },
});