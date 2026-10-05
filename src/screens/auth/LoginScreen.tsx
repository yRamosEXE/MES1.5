import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

// Lê a URL configurada no .env ou recorre ao domínio padrão
const WEB_REGISTER_URL =
  process.env.EXPO_PUBLIC_WEB_REGISTER_URL ||
  'https://keep-deck-coauthor.ngrok-free.dev/cadastro';

export function LoginScreen({ navigation }: any) {
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
    } catch (error: any) {
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
    } catch (err) {
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

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.linkText}>Esqueceu a Senha?</Text>
      </TouchableOpacity>

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
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#38bdf8',
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