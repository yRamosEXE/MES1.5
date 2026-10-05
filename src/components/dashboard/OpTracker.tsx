import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { ProductionOrder, ProductionOrderStatus } from '../../types/models';
import { RoleBadge, TeamAvatar } from '../team/TeamIdentity';
import type { FactoryRole } from '../../types/team';
import { colors } from '../../theme/colors';

const AnimatedOrder = Animated.View;

function statusLabel(status?: ProductionOrderStatus | null): string {
  if (status === 'COMPLETED') return 'Concluída';
  if (status === 'PENDING') return 'Pendente';
  return 'Em processo';
}

function statusColor(status?: ProductionOrderStatus | null): string {
  if (status === 'COMPLETED') return colors.green;
  if (status === 'PENDING') return colors.textMuted;
  return colors.amber;
}

function OrderProgress({ progress }: { progress: number }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const width = useSharedValue(0);
  const shimmer = useSharedValue(-24);
  const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;

  useEffect(() => {
    if (trackWidth <= 0) return undefined;
    const fillWidth = trackWidth * safeProgress / 100;
    width.value = withTiming(fillWidth, { duration: 950 });
    if (fillWidth <= 24) return undefined;
    shimmer.value = -24;
    shimmer.value = withRepeat(withTiming(fillWidth, { duration: 1_450 }), -1, false);
    return () => cancelAnimation(shimmer);
  }, [safeProgress, shimmer, trackWidth, width]);

  const animatedWidth = useAnimatedStyle(() => ({ width: width.value }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmer.value }] }));
  const onLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.progressTrack} onLayout={onLayout}>
      <Animated.View style={[styles.progressFill, animatedWidth]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </Animated.View>
    </View>
  );
}

function OrderRow({ order, index }: { order: ProductionOrder | null; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const safeOrder = order ?? {
    code: 'OP-SEM-CÓDIGO',
    line: '',
    operatorName: '',
    operatorInitials: '',
    progress: 0,
    due: '',
    status: 'PENDING' as const,
  };
  const color = statusColor(safeOrder.status);
  const progress = Number.isFinite(safeOrder.progress) ? Math.max(0, Math.min(100, safeOrder.progress ?? 0)) : 0;

  return (
    <AnimatedOrder entering={FadeInDown.delay(index * 75).duration(450)} style={[styles.orderCard, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ordem ${safeOrder.code ?? 'sem código'}, ${statusLabel(safeOrder.status)}, ${progress}% concluída`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={styles.pressable}
      >
        <View style={styles.orderTop}>
          <View style={styles.codeGroup}>
            <View style={styles.orderIcon}><Feather name="clipboard" size={13} color={colors.purple} /></View>
            <Text style={styles.code}>{safeOrder.code ?? 'OP sem código'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${color}18` }]}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <Text style={[styles.statusText, { color }]}>{statusLabel(safeOrder.status)}</Text>
          </View>
        </View>

        <View style={styles.orderMeta}>
          <View style={styles.operatorGroup}>
            <TeamAvatar name={safeOrder.operatorName || 'Operador não atribuído'} initials={safeOrder.operatorInitials || 'OP'} size={24} />
            <Text numberOfLines={1} style={styles.operatorName}>{safeOrder.operatorName || 'Operador não atribuído'}</Text>
          </View>
          <View style={styles.dueGroup}><Feather name="clock" size={11} color={colors.textMuted} /><Text style={styles.due}>{safeOrder.due || 'Sem prazo'}</Text></View>
        </View>
        <RoleBadge role={(safeOrder.operatorRole ?? 'OPERADOR') as FactoryRole} />

        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progresso</Text>
          <Text style={[styles.progressValue, { color }]}>{progress}%</Text>
        </View>
        <OrderProgress progress={progress} />
        {expanded ? <Text style={styles.expandedLine}>Linha de produção · {safeOrder.line || 'Não definida'}</Text> : null}
      </Pressable>
    </AnimatedOrder>
  );
}

export function OpTracker({ orders }: { orders?: readonly (ProductionOrder | null | undefined)[] | null }) {
  const safeOrders = (Array.isArray(orders) ? orders : []).filter(
    (order): order is ProductionOrder => Boolean(order && typeof order === 'object')
  );

  return (
    <View style={styles.list}>
      {safeOrders.map((order, index) => <OrderRow key={order.code} order={order} index={index} />)}
      {safeOrders.length === 0 ? <Text style={styles.empty}>Nenhuma ordem ativa.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 9 },
  orderCard: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: '#121722' },
  pressable: { padding: 12 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  codeGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderIcon: { width: 25, height: 25, borderRadius: 8, backgroundColor: '#251C3D', alignItems: 'center', justifyContent: 'center' },
  code: { color: colors.textPrimary, fontSize: 11, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '700' },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 11, gap: 8 },
  operatorGroup: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7 },
  operatorName: { color: colors.textSecondary, fontSize: 10, flexShrink: 1 },
  dueGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  due: { color: colors.textMuted, fontSize: 9 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 6 },
  progressLabel: { color: colors.textMuted, fontSize: 9 },
  progressValue: { fontSize: 9, fontWeight: '800' },
  progressTrack: { height: 5, overflow: 'hidden', borderRadius: 3, backgroundColor: colors.surfaceRaised },
  progressFill: { height: '100%', overflow: 'hidden', borderRadius: 3, backgroundColor: colors.purple },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 24, backgroundColor: '#FFFFFF', opacity: 0.26 },
  expandedLine: { color: colors.textMuted, fontSize: 9, marginTop: 10 },
  empty: { color: colors.textMuted, fontSize: 11, paddingVertical: 12 },
});