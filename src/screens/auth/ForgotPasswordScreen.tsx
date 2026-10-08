import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../services/api';
import { ApiResponse } from '../../types/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/navigationTypes';
import { ScalePressable } from '../../components/ui/ScalePressable';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
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
    } catch (error: unknown) {
      const response = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: { message?: unknown } } } }).response
        : undefined;
      const apiMessage = response?.data?.error?.message;
      const msg = typeof apiMessage === 'string' ? apiMessage : 'Falha ao solicitar recuperação.';
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

      <ScalePressable style={styles.button} onPress={handleResetPassword} disabled={submitting} accessibilityLabel="Enviar recuperação de senha">
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Enviar</Text>}
      </ScalePressable>

      <ScalePressable style={styles.linkButton} onPress={() => navigation.goBack()} accessibilityLabel="Voltar ao login">
        <Text style={styles.linkText}>Voltar ao Login</Text>
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 28 },
  input: { backgroundColor: colors.surface, color: colors.textPrimary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.green, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: colors.green, fontSize: 14 },
});