import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeInDown,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { ProductionTrendPoint } from '../../types/models';
import { colors } from '../../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const WIDTH = 340;
const HEIGHT = 154;
const LEFT = 10;
const RIGHT = 330;
const TOP = 12;
const BOTTOM = 119;

type TrendKey = 'yield' | 'quality' | 'target';

const trendSeries: ReadonlyArray<{ key: TrendKey; label: string; color: string }> = [
  { key: 'yield', label: 'Rendimento', color: colors.green },
  { key: 'quality', label: 'Qualidade', color: colors.purple },
  { key: 'target', label: 'Meta', color: colors.amber },
];

function getCoordinates(points: readonly ProductionTrendPoint[], key: TrendKey) {
  const step = points.length > 1 ? (RIGHT - LEFT) / (points.length - 1) : 0;
  return points.map((point, index) => {
    const value = Number.isFinite(point[key]) ? Math.max(0, Math.min(100, point[key])) : 0;
    return {
      x: LEFT + index * step,
      y: BOTTOM - (value / 100) * (BOTTOM - TOP),
    };
  });
}

function getCurvePath(points: ReturnType<typeof getCoordinates>): string {
  if (points.length === 0) return '';
  const first = points[0];
  const commands = points.slice(1).map((point, index) => {
    const previous = points[index];
    const middleX = (previous.x + point.x) / 2;
    return `C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  });
  return `M ${first.x} ${first.y} ${commands.join(' ')}`;
}

function getPathLength(points: ReturnType<typeof getCoordinates>): number {
  const length = points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
  return Math.max(length * 1.08, 1);
}

function TrendLine({ points, series }: { points: readonly ProductionTrendPoint[]; series: (typeof trendSeries)[number] }) {
  const coordinates = useMemo(() => getCoordinates(points, series.key), [points, series.key]);
  const path = useMemo(() => getCurvePath(coordinates), [coordinates]);
  const pathLength = useMemo(() => getPathLength(coordinates), [coordinates]);
  const drawProgress = useSharedValue(0);
  const areaPulse = useSharedValue(0.14);
  const seriesDelay = series.key === 'yield' ? 80 : series.key === 'quality' ? 210 : 340;

  useEffect(() => {
    drawProgress.value = 0;
    drawProgress.value = withDelay(seriesDelay, withTiming(1, { duration: 1_050 }));
    return () => cancelAnimation(drawProgress);
  }, [drawProgress, path, seriesDelay]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: pathLength * (1 - drawProgress.value) }));
  useEffect(() => {
    if (series.key !== 'yield') return undefined;
    areaPulse.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 1_600 }), withTiming(0.12, { duration: 1_600 })),
      -1,
      false
    );
    return () => cancelAnimation(areaPulse);
  }, [areaPulse, series.key]);
  const areaAnimatedProps = useAnimatedProps(() => ({ fillOpacity: areaPulse.value }));
  const areaPath = series.key === 'yield' && path.length > 0
    ? `${path} L ${RIGHT} ${BOTTOM} L ${LEFT} ${BOTTOM} Z`
    : '';

  return (
    <>
      {areaPath ? <AnimatedPath d={areaPath} fill="url(#yieldFill)" animatedProps={areaAnimatedProps} /> : null}
      <AnimatedPath
        d={path}
        fill="none"
        stroke={series.color}
        strokeDasharray={`${pathLength} ${pathLength}`}
        strokeWidth={series.key === 'target' ? 1.5 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </>
  );
}

function LiveGlowDot({ x, y }: { x: number; y: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 850 }), withTiming(0, { duration: 850 })),
      -1,
      false
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const haloProps = useAnimatedProps(() => ({
    r: 4 + pulse.value * 4,
    opacity: 0.65 - pulse.value * 0.55,
  }));

  return (
    <>
      <AnimatedCircle cx={x} cy={y} fill={colors.green} animatedProps={haloProps} />
      <Circle cx={x} cy={y} r={3.5} fill={colors.green} stroke={colors.background} strokeWidth={1.5} />
    </>
  );
}

type Props = { points?: readonly (ProductionTrendPoint | null | undefined)[] | null };

export function ProductionTrendChart({ points }: Props) {
  const safePoints = (Array.isArray(points) ? points : []).filter(
    (point): point is ProductionTrendPoint => Boolean(point && typeof point.label === 'string')
  );
  const yieldCoordinates = useMemo(() => getCoordinates(safePoints, 'yield'), [safePoints]);
  const lastYieldPoint = yieldCoordinates[yieldCoordinates.length - 1];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(550)}>
      <View style={styles.chart}>
        <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
          <Defs>
            <SvgLinearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.green} stopOpacity="0.23" />
              <Stop offset="1" stopColor={colors.green} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          {[0, 1, 2, 3].map((index) => {
            const y = TOP + index * ((BOTTOM - TOP) / 3);
            return <Path key={index} d={`M ${LEFT} ${y} H ${RIGHT}`} stroke={colors.border} strokeWidth={1} />;
          })}
          {safePoints.length > 0 ? trendSeries.map((series) => (
            <TrendLine key={series.key} points={safePoints} series={series} />
          )) : null}
          {lastYieldPoint ? <LiveGlowDot x={lastYieldPoint.x} y={lastYieldPoint.y} /> : null}
          {safePoints.map((point, index) => {
            const x = safePoints.length > 1 ? LEFT + index * ((RIGHT - LEFT) / (safePoints.length - 1)) : (LEFT + RIGHT) / 2;
            return <SvgText key={`${point.label}-${index}`} x={x} y={145} fill={colors.textMuted} fontSize={9} textAnchor="middle">{point.label}</SvgText>;
          })}
        </Svg>
        {safePoints.length === 0 ? <Text style={styles.empty}>Sem dados de tendência</Text> : null}
      </View>
      <View style={styles.legend}>
        {trendSeries.map((series) => (
          <View key={series.key} style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: series.color }]} />
            <Text style={styles.legendText}>{series.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chart: { position: 'relative', height: HEIGHT, marginTop: 12 },
  empty: { position: 'absolute', top: '45%', alignSelf: 'center', color: colors.textMuted, fontSize: 11 },
  legend: { flexDirection: 'row', gap: 18, marginTop: 6, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine: { width: 12, height: 3, borderRadius: 2 },
  legendText: { color: colors.textSecondary, fontSize: 10 },
});