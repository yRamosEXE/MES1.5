import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export const SPLASH_BACKGROUND = '#0A281E';

const ENTER_DURATION = 700;
const EXIT_DURATION = 350;

type Props = {
  /** Quando true, a splash faz o fade-out e chama onFinish. */
  ready: boolean;
  onFinish: () => void;
};

export function AnimatedSplash({ ready, onFinish }: Props) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: ENTER_DURATION });
    logoScale.value = withTiming(1, { duration: ENTER_DURATION, easing: Easing.out(Easing.cubic) });
  }, [logoOpacity, logoScale]);

  useEffect(() => {
    if (!ready) return;
    logoScale.value = withTiming(1.06, { duration: EXIT_DURATION });
    overlayOpacity.value = withDelay(
      60,
      withTiming(0, { duration: EXIT_DURATION }, (finished) => {
        if (finished) scheduleOnRN(onFinish);
      })
    );
  }, [ready, onFinish, logoScale, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle]}
      // Esconde a splash nativa só quando a animada já está desenhada (sem flash branco).
      onLayout={() => void SplashScreen.hideAsync().catch(() => undefined)}
      pointerEvents={ready ? 'none' : 'auto'}
    >
      <Animated.View style={logoStyle}>
        <Image
          source={require('../../assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="MES 1.5"
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
