import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TeamAvatar } from '../team/TeamIdentity';
import { colors } from '../../theme/colors';

type Props = {
  lastUpdated?: string | null;
  source?: 'live' | 'mock' | null;
  refreshing?: boolean | null;
  onRefresh?: (() => void) | null;
  onOpenProfile?: () => void;
};

export function ExecutiveHeader({ lastUpdated, source, refreshing, onRefresh, onOpenProfile }: Props) {
  const safeLastUpdated = lastUpdated ?? 'agora';
  const safeSource = source ?? 'mock';
  const isRefreshing = refreshing ?? false;
  const pulse = useSharedValue(0.45);
  const radar = useSharedValue(0);
  const rotation = useSharedValue(0);
  const refreshScale = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.4, { duration: 800 })),
      -1,
      true
    );
    radar.value = withRepeat(withTiming(1, { duration: 1_600 }), -1, false);
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(radar);
    };
  }, [pulse, radar]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.82 + pulse.value * 0.28 }],
  }));
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const radarStyle = useAnimatedStyle(() => ({
    opacity: 0.72 * (1 - radar.value),
    transform: [{ scale: 1 + radar.value * 1.5 }],
  }));
  const refreshScaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: refreshScale.value }] }));

  const refresh = () => {
    rotation.value = withTiming(rotation.value + 360, { duration: 620 });
    onRefresh?.();
  };

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandBlock}>
          <View style={styles.brandMark}><Feather name="activity" size={16} color={colors.green} /></View>
          <Text style={styles.brand}>MES <Text style={styles.brandAccent}>/ CONTROL</Text></Text>
        </View>
        <Animated.View style={[styles.refreshButton, refreshScaleStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar painel"
            onPress={refresh}
            onPressIn={() => { refreshScale.value = withSpring(0.94); }}
            onPressOut={() => { refreshScale.value = withSpring(1); }}
            hitSlop={8}
            style={styles.refreshHitArea}
          >
            <Animated.View style={rotateStyle}>
              <Feather name="rotate-cw" size={17} color={colors.textPrimary} />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>PAINEL EXECUTIVO</Text>
          <Text style={styles.title}>Operação industrial</Text>
        </View>
        <TeamAvatar name="Marina Costa · Perfil" initials="MC" size={46} onPress={onOpenProfile} />
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusGroup}>
          <View style={styles.pulseWrap}>
            <Animated.View style={[styles.radarRing, radarStyle]} />
            <Animated.View style={[styles.pulseDot, pulseStyle]} />
          </View>
          <Text style={styles.statusText}>{safeSource === 'live' ? 'MONITORAMENTO AO VIVO' : 'MODO DEMONSTRAÇÃO'}</Text>
        </View>
        <Text style={styles.updatedText}>Atualizado {safeLastUpdated}{isRefreshing ? ' · sincronizando' : ''}</Text>
      </View>
      <Text style={styles.operatorText}>Marina Costa <Text style={styles.operatorRole}>· Supervisora</Text></Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#123A2A' },
  brand: { color: colors.textPrimary, fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  brandAccent: { color: colors.textMuted, fontWeight: '600' },
  refreshButton: { width: 38, height: 38, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, overflow: 'visible' },
  refreshHitArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27 },
  titleBlock: { flex: 1 },
  eyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: colors.textPrimary, fontSize: 25, fontWeight: '700', marginTop: 5 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 20 },
  statusGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseWrap: { width: 9, height: 9, alignItems: 'center', justifyContent: 'center' },
  radarRing: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  statusText: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 0.65 },
  updatedText: { color: colors.textMuted, fontSize: 10 },
  operatorText: { marginTop: 9, color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  operatorRole: { color: colors.textMuted, fontWeight: '400' },
});