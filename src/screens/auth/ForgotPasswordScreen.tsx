import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../services/api';
import { ApiResponse } from '../../types/api';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Atenção', 'Informe o seu e-mail cadastrado.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
      Alert.alert('Sucesso', 'Instruções de recuperação foram enviadas para o seu e-mail.');
      navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Falha ao solicitar recuperação.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Acesso</Text>
      <Text style={styles.subtitle}>Digite seu e-mail corporativo para receber as instruções</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail cadastrado"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Enviar</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Voltar ao Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 28 },
  input: { backgroundColor: '#1e293b', color: '#ffffff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#38bdf8', fontSize: 14 },
});