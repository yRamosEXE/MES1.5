import type { Machine, MachineStatus } from '../types/models';

export async function notifyMachineStopped(machine: Pick<Machine, 'id' | 'name' | 'line'>): Promise<string | null> {
  try {
    // Load the native module only when a local alert is requested. This keeps app startup
    // independent from notification support in Expo Go or other runtimes.
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Máquina em parada',
        body: `${machine.name} · ${machine.line}`,
        data: { machineId: machine.id },
      },
      trigger: null,
    });
  } catch (error: unknown) {
    console.warn('Notificação local indisponível neste ambiente:', error);
    return null;
  }
}

export async function notifyOnStatusTransition(previousStatus: MachineStatus, machine: Machine): Promise<string | null> {
  if (machine.status !== 'PARADA' || previousStatus === 'PARADA') return null;
  return notifyMachineStopped(machine);
}