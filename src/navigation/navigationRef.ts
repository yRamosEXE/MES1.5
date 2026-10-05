import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './navigationTypes';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function openMachineDetail(machineId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MachineDetail', { machineId });
  }
}