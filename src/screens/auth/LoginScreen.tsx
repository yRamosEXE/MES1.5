import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/navigationTypes';
import { ScalePressable } from '../../components/ui/ScalePressable';
import { colors } from '../../theme/colors';

// Lê a URL configurada no .env ou recorre ao domínio padrão
const WEB_REGISTER_URL =
  process.env.EXPO_PUBLIC_WEB_REGISTER_URL ||
  'https://keep-deck-coauthor.ngrok-free.dev/request-access';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useContext(AuthContext);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email, password);
    } catch {
      Alert.alert('Falha na autenticação', 'Credenciais inválidas ou serviço indisponível.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOpenWebRegister() {
    try {
      const supported = await Linking.canOpenURL(WEB_REGISTER_URL);
      if (supported) {
        await Linking.openURL(WEB_REGISTER_URL);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o navegador padrão.');
      }
    } catch {
      Alert.alert('Erro', 'Ocorreu uma falha ao redirecionar para o portal web.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoramento IoT</Text>
      <Text style={styles.subtitle}>Acesse à sua conta para acompanhar as máquinas</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail corporativo"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <ScalePressable
        style={styles.button}
        onPress={handleLogin}
        disabled={submitting}
        accessibilityLabel="Entrar"
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </ScalePressable>

      <ScalePressable
        style={styles.linkButton}
        onPress={() => navigation.navigate('ForgotPassword')}
        accessibilityLabel="Recuperar senha"
      >
        <Text style={styles.linkText}>Esqueceu a Senha?</Text>
      </ScalePressable>

      {/* Redirecionamento para cadastro web corporativo */}
      <View style={styles.webRegisterContainer}>
        <Text style={styles.webRegisterLabel}>Ainda não tem acesso corporativo?</Text>
        <TouchableOpacity onPress={handleOpenWebRegister} activeOpacity={0.7}>
          <Text style={styles.webRegisterLink}>Cadastre-se na Plataforma Web</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: colors.green,
    fontSize: 14,
  },
  webRegisterContainer: {
    marginTop: 36,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 24,
  },
  webRegisterLabel: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 6,
  },
  webRegisterLink: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});