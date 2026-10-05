import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { Alert } from '../../types/models';
import { colors } from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  alert: Alert;
  index: number;
  onPress: (machineId: string) => void;
};

export function AlertPreviewCard({ alert, index, onPress }: Props) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = alert.severity === 'critical' ? colors.red : colors.amber;
  const alertTitle = alert.title || 'Alerta sem descrição';
  const machineName = alert.machineName || 'Máquina não identificada';

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(440)}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`${alertTitle}, ${machineName}`}
        onPress={() => onPress(alert.machineId)}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.row, pressStyle]}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <Feather name={alert.severity === 'critical' ? 'alert-circle' : 'alert-triangle'} size={14} color={accent} />
        </View>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>{alertTitle}</Text>
          <Text numberOfLines={1} style={styles.meta}>{machineName} · {alert.occurredAt || 'horário indisponível'}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: accent }]} />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border },
  iconWrap: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0 },
  title: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
});