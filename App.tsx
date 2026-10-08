import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { Routes } from './src/navigation';
import { OfflineBanner } from './src/components/OfflineBanner';
import { AnimatedSplash } from './src/components/AnimatedSplash';

// Mantém a splash nativa visível até a splash animada estar desenhada.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Tempo mínimo para a animação de entrada não "piscar" em sessões rápidas.
const MIN_SPLASH_MS = 1200;

function AppContent() {
  const { loading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = useCallback(() => setSplashVisible(false), []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <OfflineBanner />
      <Routes />
      {splashVisible && (
        <AnimatedSplash ready={!loading && minTimeElapsed} onFinish={handleSplashFinish} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
