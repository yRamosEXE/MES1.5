import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AlertsFeedScreen } from '../screens/AlertsFeedScreen';
import { MachineDetailScreen } from '../screens/MachineDetailScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { MainTabParamList, RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 69, paddingTop: 9, paddingBottom: 8, backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { ...typography.label, fontSize: 10, marginTop: 2 },
        tabBarIcon: ({ color, size, focused }) => (
          <Feather name={route.name === 'HomeTab' ? (focused ? 'grid' : 'home') : (focused ? 'bell' : 'bell')} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="HomeTab" options={{ title: 'Planta' }}>
        {({ navigation }) => <HomeScreen onOpenMachine={(machineId) => navigation.getParent()?.navigate('MachineDetail', { machineId })} />}
      </Tabs.Screen>
      <Tabs.Screen name="AlertsTab" options={{ title: 'Alertas', tabBarBadge: 3, tabBarBadgeStyle: { backgroundColor: colors.red, color: colors.white, fontSize: 9, minWidth: 15, height: 15 } }}>
        {({ navigation }) => <AlertsFeedScreen onOpenMachine={(machineId) => navigation.getParent()?.navigate('MachineDetail', { machineId })} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary, headerTitleStyle: { ...typography.subtitle }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="MachineDetail" options={{ title: 'Equipamento', headerBackTitle: 'Voltar' }}>
        {({ route }) => <MachineDetailScreen machineId={route.params.machineId} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}