import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

// Ecrã temporário para representar a área pós-login até o Paulo ligar a Home
function HomeScreenPlaceholder() {
  const { user, signOut } = useContext(AuthContext);

  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.title}>Painel de Máquinas</Text>
      <Text style={homeStyles.text}>Bem-vindo, {user?.name || 'Gestor'}!</Text>
      <TouchableOpacity style={homeStyles.logoutButton} onPress={signOut}>
        <Text style={homeStyles.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  text: { color: '#94a3b8', fontSize: 16, marginBottom: 24 },
  logoutButton: { backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});

export function Routes() {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {signed ? (
        <Stack.Screen name="HomeDashboard" component={HomeScreenPlaceholder} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}