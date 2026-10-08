import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { alerts } from '../data/mockData';
import { getLatestAlerts } from '../services/alertService';
import { HomeScreen } from '../screens/HomeScreen';
import { AlertsFeedScreen } from '../screens/AlertsFeedScreen';
import { MachineDetailScreen } from '../screens/MachineDetailScreen';
import { MachinesScreen } from '../screens/MachinesScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { ProfileModal } from '../screens/ProfileModal';
import { EmergencyReassignModal } from '../screens/EmergencyReassignModal';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { MainTabParamList, RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function DashboardTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <HomeScreen
      onOpenMachine={(machineId) => navigation.navigate('MachineDetail', { machineId })}
      onOpenProfile={() => navigation.navigate('ProfileModal')}
    />
  );
}

function MachinesTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <MachinesScreen
      onOpenMachine={(machineId) => navigation.navigate('MachineDetail', { machineId })}
      onReassign={(machineId) => navigation.navigate('EmergencyReassignModal', { machineId })}
    />
  );
}

function AlertsTab() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <AlertsFeedScreen onOpenMachine={(machineId) => navigation.navigate('MachineDetail', { machineId })} />;
}

function MainTabs() {
  const [pendingAlerts, setPendingAlerts] = useState(() => alerts.filter((alert) => !alert.acknowledged).length);

  const refreshPendingAlerts = useCallback(async () => {
    try {
      const currentAlerts = await getLatestAlerts();
      setPendingAlerts(currentAlerts.filter((alert) => !alert.acknowledged).length);
    } catch (error: unknown) {
      console.info('Mantendo badge offline de alertas.', error);
    }
  }, []);

  useEffect(() => {
    void refreshPendingAlerts();
    const interval = setInterval(() => void refreshPendingAlerts(), 30_000);
    return () => clearInterval(interval);
  }, [refreshPendingAlerts]);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 7, backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 },
        tabBarLabelStyle: { ...typography.label, fontSize: 10, marginTop: 2 },
        tabBarBadge: route.name === 'Alerts' && pendingAlerts > 0 ? pendingAlerts : undefined,
        tabBarBadgeStyle: { minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.red, color: colors.white, fontSize: 9, fontWeight: '800' },
        tabBarIcon: ({ color, size }) => {
          const icons = { Dashboard: 'grid', Machines: 'cpu', Alerts: 'bell', Team: 'users' } as const;
          return <Feather name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Dashboard" component={DashboardTab} options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="Machines" component={MachinesTab} options={{ title: 'Máquinas' }} />
      <Tabs.Screen name="Alerts" component={AlertsTab} options={{ title: 'Alertas' }} />
      <Tabs.Screen name="Team" component={TeamScreen} options={{ title: 'Equipe' }} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { ...typography.subtitle },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="MachineDetail" component={MachineDetailScreen} options={{ title: 'Equipamento', headerBackTitle: 'Voltar' }} />
      <Stack.Screen name="ProfileModal" component={ProfileModal} options={{ presentation: 'transparentModal', headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="EmergencyReassignModal" component={EmergencyReassignModal} options={{ presentation: 'transparentModal', headerShown: false, contentStyle: { backgroundColor: 'transparent' }, animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}