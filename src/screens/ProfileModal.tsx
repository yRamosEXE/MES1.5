import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { RoleBadge, TeamAvatar } from '../components/team/TeamIdentity';
import { ScalePressable } from '../components/ui/ScalePressable';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../navigation/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileModal'>;

export function ProfileModal({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [shift, setShift] = useState<'A' | 'B' | 'C'>('A');
  const [criticalNotifications, setCriticalNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const savePassword = () => {
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
      Alert.alert('Revise os campos', 'Informe a senha atual, uma nova senha com 8 caracteres e confirme-a.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Solicitação registrada', 'A alteração foi validada localmente e será sincronizada quando o serviço de identidade estiver disponível.');
  };

  const confirmLogout = () => {
    Alert.alert('Encerrar sessão?', 'Você voltará para a tela de acesso.', [
      { text: 'Continuar conectado', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => { void signOut(); } },
    ]);
  };

  const accountName = user?.name?.trim() || 'Marina Costa';
  const initials = accountName.split(/\s+/).map((part) => part.charAt(0)).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'MC';

  return (
    <View style={styles.backdrop}>
      <ScalePressable onPress={() => navigation.goBack()} style={styles.backdropHit} accessibilityLabel="Fechar perfil" />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <View><Text style={styles.eyebrow}>CONTA & TURNO</Text><Text style={styles.title}>Perfil executivo</Text></View>
            <ScalePressable onPress={() => navigation.goBack()} style={styles.closeButton} accessibilityLabel="Fechar perfil"><Feather name="x" size={17} color={colors.textSecondary} /></ScalePressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarRing}>
              <Svg width={74} height={74} viewBox="0 0 74 74" style={StyleSheet.absoluteFill}>
                <Defs><LinearGradient id="profileRing" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={colors.green} /><Stop offset="0.55" stopColor={colors.purple} /><Stop offset="1" stopColor={colors.amber} /></LinearGradient></Defs>
                <Circle cx="37" cy="37" r="34" fill="none" stroke="url(#profileRing)" strokeWidth="2" />
              </Svg>
              <TeamAvatar name={accountName} initials={initials} size={62} />
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{accountName}</Text>
              <Text style={styles.profileEmail}>{user?.email?.trim() || 'marina.costa@fabrica.com.br'}</Text>
              <RoleBadge role="LIDER_OPERACAO" label="Supervisora de Operações" />
            </View>
          </View>

          <View style={styles.shiftCard}>
            <View style={styles.shiftTitleRow}><Feather name="clock" size={14} color={colors.green} /><Text style={styles.blockTitle}>Turno atual</Text><View style={styles.activeChip}><View style={styles.activeDot} /><Text style={styles.activeText}>ATIVO</Text></View></View>
            <View style={styles.shiftBottom}>
              <Text style={styles.shiftName}>Turno {shift} <Text style={styles.shiftHours}>({shift === 'A' ? '06:00 - 14:00' : shift === 'B' ? '14:00 - 22:00' : '22:00 - 06:00'})</Text></Text>
              <View style={styles.shiftChoices}>{(['A', 'B', 'C'] as const).map((item) => <ScalePressable key={item} onPress={() => setShift(item)} style={[styles.shiftChoice, shift === item && styles.shiftChoiceActive]} accessibilityLabel={`Selecionar turno ${item}`}><Text style={[styles.shiftChoiceText, shift === item && styles.shiftChoiceTextActive]}>{item}</Text></ScalePressable>)}</View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.blockTitle}>Dados da unidade</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoCell}><Text style={styles.infoLabel}>MATRÍCULA</Text><Text style={styles.infoValue}>M-00428</Text></View>
              <View style={styles.infoCell}><Text style={styles.infoLabel}>SETOR</Text><Text style={styles.infoValue}>Operações</Text></View>
              <View style={styles.infoCell}><Text style={styles.infoLabel}>UNIDADE</Text><Text style={styles.infoValue}>Planta São Paulo</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.switchRow}><View style={styles.switchCopy}><Text style={styles.blockTitle}>Notificações críticas</Text><Text style={styles.infoLabel}>Paradas, falhas e segurança da fábrica</Text></View><Switch value={criticalNotifications} onValueChange={setCriticalNotifications} trackColor={{ false: colors.surfaceRaised, true: '#006B3C' }} thumbColor={criticalNotifications ? colors.green : colors.textMuted} /></View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}><Feather name="lock" size={13} color={colors.textSecondary} /><Text style={styles.blockTitle}>Alterar senha</Text></View>
            <TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Senha atual" placeholderTextColor={colors.textMuted} secureTextEntry={!passwordVisible} style={styles.input} />
            <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="Nova senha · mínimo 8 caracteres" placeholderTextColor={colors.textMuted} secureTextEntry={!passwordVisible} style={styles.input} />
            <View style={styles.passwordRow}>
              <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar senha" placeholderTextColor={colors.textMuted} secureTextEntry={!passwordVisible} style={[styles.input, styles.confirmInput]} />
              <ScalePressable onPress={() => setPasswordVisible((value) => !value)} style={styles.visibilityButton} accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}><Feather name={passwordVisible ? 'eye-off' : 'eye'} size={15} color={colors.textSecondary} /></ScalePressable>
            </View>
            <ScalePressable onPress={savePassword} style={styles.saveButton} accessibilityLabel="Validar alteração de senha"><Text style={styles.saveText}>Validar alteração</Text></ScalePressable>
          </View>

          <ScalePressable onPress={confirmLogout} style={styles.logoutButton} accessibilityLabel="Terminar sessão"><Feather name="log-out" size={15} color={colors.red} /><Text style={styles.logoutText}>Terminar sessão</Text></ScalePressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' },
  backdropHit: StyleSheet.absoluteFill,
  sheet: { maxHeight: '94%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingTop: 10 },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: colors.surfaceBorder, alignSelf: 'center', marginBottom: 15 },
  content: { paddingHorizontal: 20, paddingBottom: 34 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  eyebrow: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 4 },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.surface },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface },
  avatarRing: { width: 74, height: 74, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, alignItems: 'flex-start', gap: 5 },
  profileName: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  profileEmail: { color: colors.textMuted, fontSize: 9, marginBottom: 2 },
  shiftCard: { marginTop: 12, padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  shiftTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  blockTitle: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: '#00E67618' },
  activeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green },
  activeText: { color: colors.green, fontSize: 7, fontWeight: '800' },
  shiftBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  shiftName: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  shiftHours: { color: colors.textSecondary, fontWeight: '400' },
  shiftChoices: { flexDirection: 'row', gap: 4 },
  shiftChoice: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: colors.surfaceRaised },
  shiftChoiceActive: { backgroundColor: colors.green },
  shiftChoiceText: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  shiftChoiceTextActive: { color: colors.background },
  section: { marginTop: 13, padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 7, marginTop: 12 },
  infoCell: { flex: 1, minWidth: 0 },
  infoLabel: { color: colors.textMuted, fontSize: 7, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { color: colors.textPrimary, fontSize: 9, fontWeight: '600', marginTop: 5 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchCopy: { flex: 1, gap: 5 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  input: { minHeight: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, color: colors.textPrimary, fontSize: 11, paddingHorizontal: 11, marginBottom: 8 },
  passwordRow: { flexDirection: 'row', gap: 7 },
  confirmInput: { flex: 1 },
  visibilityButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background },
  saveButton: { minHeight: 39, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.surfaceRaised, marginTop: 2 },
  saveText: { color: colors.textPrimary, fontSize: 10, fontWeight: '700' },
  logoutButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#FF525244', borderRadius: 11, backgroundColor: '#FF52520D', marginTop: 13 },
  logoutText: { color: colors.red, fontSize: 10, fontWeight: '700' },
});