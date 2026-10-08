export type RootStackParamList = {
  MainTabs: undefined;
  MachineDetail: { machineId: string };
  ProfileModal: undefined;
  EmergencyReassignModal: { machineId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Machines: undefined;
  Alerts: undefined;
  Team: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};