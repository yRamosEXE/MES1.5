import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import type { Machine, MachineStatus } from '../../types/models';
import { colors } from '../../theme/colors';
import { ScalePressable } from '../ui/ScalePressable';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CHART_SIZE = 176;
const CENTER = CHART_SIZE / 2;
const RADIUS = 61;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_DEFINITIONS: ReadonlyArray<Pick<Segment, 'status' | 'label' | 'color'>> = [
  { status: 'OPERANDO', label: 'Operando', color: colors.green },
  { status: 'MANUTENÇÃO', label: 'Em ajuste', color: colors.amber },
  { status: 'PARADA', label: 'Paradas', color: colors.red },
  { status: 'OFFLINE', label: 'Sem sinal', color: colors.purple },
];

type Segment = {
  status: MachineStatus;
  label: string;
  color: string;
  count: number;
  percent: number;
  startAngle: number;
};

type ArcProps = {
  segment: Segment;
  selected: boolean;
  dimmed: boolean;
  delay: number;
};

function DonutArc({ segment, selected, dimmed, delay }: ArcProps) {
  const progress = useSharedValue(0);
  const arcLength = CIRCUMFERENCE * segment.percent / 100;

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 900 }));
  }, [delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arcLength * (1 - progress.value),
  }));

  if (arcLength <= 0) return null;

  return (
    <AnimatedCircle
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      fill="none"
      stroke={segment.color}
      strokeWidth={selected ? 18 : 14}
      strokeLinecap="round"
      strokeDasharray={`${arcLength} ${CIRCUMFERENCE}`}
      rotation={segment.startAngle - 90}
      originX={CENTER}
      originY={CENTER}
      opacity={dimmed ? 0.28 : 1}
      animatedProps={animatedProps}
    />
  );
}

type Props = { machines?: readonly (Machine | null | undefined)[] | null };

export function StatusDonut({ machines }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<MachineStatus | null>(null);
  const isCompact = useWindowDimensions().width < 380;
  const rotation = useSharedValue(0);
  const breathing = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 60_000 }), -1, false);
    breathing.value = withRepeat(
      withSequence(
        withSpring(1.03, { damping: 12, stiffness: 45 }),
        withSpring(1, { damping: 12, stiffness: 45 })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(breathing);
    };
  }, [breathing, rotation]);

  const rotationStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const breathingStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathing.value }] }));

  const segments = useMemo(() => {
    const safeMachines = (Array.isArray(machines) ? machines : []).filter(
      (machine): machine is Machine => Boolean(machine && typeof machine.id === 'string')
    );
    let startAngle = 0;
    const total = safeMachines.length;
    return SEGMENT_DEFINITIONS.map((definition) => {
      const count = safeMachines.filter((machine) => machine.status === definition.status).length;
      const percent = total === 0 ? 0 : count / total * 100;
      const segment = { ...definition, count, percent, startAngle };
      startAngle += percent / 100 * 360;
      return segment;
    });
  }, [machines]);

  const operatingPercent = segments.find((segment) => segment.status === 'OPERANDO')?.percent ?? 0;
  const hasSelection = selectedStatus !== null;

  return (
    <Animated.View entering={FadeIn.duration(550)} style={[styles.layout, isCompact && styles.layoutCompact]}>
      <View style={styles.chartWrap}>
        <Animated.View style={rotationStyle}>
          <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={colors.surfaceRaised} strokeWidth={14} />
            {segments.map((segment, index) => (
              <DonutArc
                key={segment.status}
                segment={segment}
                selected={selectedStatus === segment.status}
                dimmed={hasSelection && selectedStatus !== segment.status}
                delay={index * 100}
              />
            ))}
          </Svg>
        </Animated.View>
      </View>
      <View pointerEvents="none" style={styles.centerLabel}>
        <Animated.Text style={[styles.centerValue, breathingStyle]}>{Math.round(operatingPercent)}%</Animated.Text>
        <Text style={styles.centerCaption}>OPERANDO</Text>
      </View>
      <View style={[styles.legend, isCompact && styles.legendCompact]}>
        {segments.map((segment) => {
          const isSelected = selectedStatus === segment.status;
          return (
            <ScalePressable
              key={segment.status}
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedStatus(isSelected ? null : segment.status)}
              style={[styles.legendRow, isSelected && styles.legendPressed]}
            >
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text numberOfLines={1} style={[styles.legendLabel, isSelected && styles.legendSelected]}>{segment.label}</Text>
              <Text style={styles.legendPercent}>{Math.round(segment.percent)}%</Text>
              <Text style={styles.legendCount}>{segment.count}</Text>
            </ScalePressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  layoutCompact: { flexDirection: 'column', justifyContent: 'center' },
  chartWrap: { width: CHART_SIZE, height: CHART_SIZE, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { position: 'absolute', alignItems: 'center' },
  centerValue: { color: colors.textPrimary, fontSize: 27, fontWeight: '700' },
  centerCaption: { color: colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginTop: 1 },
  legend: { flex: 1, gap: 4, minWidth: 0 },
  legendCompact: { flex: 0, width: '100%', alignSelf: 'stretch' },
  legendRow: { minHeight: 31, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 8, paddingHorizontal: 5 },
  legendPressed: { backgroundColor: colors.surfaceRaised },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendLabel: { flex: 1, color: colors.textSecondary, fontSize: 10, fontWeight: '500' },
  legendSelected: { color: colors.textPrimary, fontWeight: '700' },
  legendPercent: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  legendCount: { width: 17, textAlign: 'right', color: colors.textMuted, fontSize: 9 },
});