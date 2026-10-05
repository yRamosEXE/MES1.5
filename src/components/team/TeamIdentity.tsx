import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import type { FactoryRole } from '../../types/team';
import { FACTORY_ROLE_LABELS } from '../../types/team';
import { colors } from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const roleColors: Record<FactoryRole, string> = {
  OPERADOR: colors.green,
  LIDER_OPERACAO: colors.purple,
  TECNICO_MANUTENCAO: colors.amber,
  LIDER_MANUTENCAO: colors.red,
};

type AvatarProps = {
  name: string;
  initials: string;
  size?: number;
  imageUri?: string;
  onPress?: () => void;
};

export function TeamAvatar({ name, initials, size = 34, imageUri, onPress }: AvatarProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={name}
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, borderColor: colors.green }, animatedStyle]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }} />
      ) : (
        <Text style={[styles.initials, { fontSize: Math.max(8, size * 0.28) }]}>{initials || 'OP'}</Text>
      )}
    </AnimatedPressable>
  );
}

export function RoleBadge({ role, onPress, label }: { role: FactoryRole; onPress?: () => void; label?: string }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const tint = roleColors[role];

  return (
    <AnimatedPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.badge, { backgroundColor: `${tint}18`, borderColor: `${tint}50` }, animatedStyle]}
    >
      <View style={[styles.badgeDot, { backgroundColor: tint }]} />
      <Text numberOfLines={1} style={[styles.badgeText, { color: tint }]}>{label ?? FACTORY_ROLE_LABELS[role]}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  avatar: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, backgroundColor: colors.surfaceRaised },
  initials: { color: colors.textPrimary, fontWeight: '800' },
  badge: { maxWidth: 150, minHeight: 23, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 8, fontWeight: '700' },
});