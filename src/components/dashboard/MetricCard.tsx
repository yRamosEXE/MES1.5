import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

type Props = {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  accent: string;
  delay: number;
  helper: string;
};

export function MetricCard({ label, value, icon, accent, delay, helper }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(-26);
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  useEffect(() => {
    if (trackWidth <= 0) return undefined;
    const fillWidth = trackWidth * safeValue / 100;
    progress.value = withTiming(fillWidth, { duration: 850 });
    if (fillWidth <= 26) return undefined;
    shimmer.value = -26;
    shimmer.value = withRepeat(withTiming(fillWidth, { duration: 1_550 }), -1, false);
    return () => cancelAnimation(shimmer);
  }, [progress, safeValue, shimmer, trackWidth]);

  const fillStyle = useAnimatedStyle(() => ({ width: progress.value }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmer.value }] }));
  const onTrackLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(480)} style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <Feather name={icon} size={15} color={accent} />
        </View>
        <Text style={styles.helper}>{helper}</Text>
      </View>
      <Text style={styles.value}>{safeValue.toFixed(1)}<Text style={styles.percent}>%</Text></Text>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track} onLayout={onTrackLayout}>
        <Animated.View style={[styles.fill, { backgroundColor: accent }, fillStyle]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { width: '48.4%', minHeight: 142, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, padding: 14, marginBottom: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  helper: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
  value: { color: colors.textPrimary, fontSize: 26, lineHeight: 32, fontWeight: '700', marginTop: 13 },
  percent: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  label: { color: colors.textSecondary, fontSize: 11, marginTop: 1 },
  track: { height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: colors.surfaceRaised, marginTop: 12 },
  fill: { height: '100%', borderRadius: 2 },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 22, backgroundColor: '#FFFFFF', opacity: 0.28 },
});