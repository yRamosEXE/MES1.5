import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sessão Autenticada</Text>
        <Text style={styles.subtitle}>Módulo de Autenticação MES 1.5</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{user?.name || 'Carregando...'}</Text>

          <Text style={styles.infoLabel}>E-mail:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Carregando...'}</Text>

          <Text style={styles.infoLabel}>Nível de Acesso (Role):</Text>
          <Text style={styles.badge}>{user?.role || 'OPERADOR'}</Text>
        </View>

        <Text style={styles.handoffNote}>
          Área de métricas e linhas em desenvolvimento por VH / Paulo.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#334155' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  infoBox: { backgroundColor: '#0f172a', padding: 16, borderRadius: 8, marginBottom: 16 },
  infoLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginTop: 8 },
  infoValue: { fontSize: 15, color: '#f8fafc', fontWeight: '500' },
  badge: { color: '#38bdf8', fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  handoffNote: { fontSize: 12, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
  logoutButton: { backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});