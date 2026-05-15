import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n';

// Cómo se muestran las notificaciones cuando la app está en foreground.
// API nueva de SDK 54: shouldShowBanner / shouldShowList reemplazan a shouldShowAlert.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL = 'habit-reminders';
// Cada recordatorio tiene su propio id en la DB; lo usamos como identifier único
// de la notificación nativa. Permite N recordatorios por hábito sin colisión.
const notifId = (reminderId: number) => `habit-reminder-${reminderId}`;

// Solo en desarrollo: imprime en consola el estado actual de notifs programadas.
const dumpScheduled = async (label: string) => {
  if (!__DEV__) return;
  const list = await Notifications.getAllScheduledNotificationsAsync();
  const summary = list.map((n) => ({
    id: n.identifier,
    title: n.content.title,
    body: n.content.body,
    trigger: n.trigger,
  }));
  console.log(`[notifs] ${label} → programadas: ${list.length}`, summary);
};

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async ensureAndroidChannel() {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: i18n.t('notif.channelName'),
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  },

  // Programa un recordatorio diario. Idempotente por reminderId:
  // cancela el previo con el mismo id antes de crear el nuevo.
  async scheduleReminder(
    reminderId: number,
    habitName: string,
    hour: number,
    minute: number,
  ): Promise<void> {
    await this.ensureAndroidChannel();
    await Notifications.cancelScheduledNotificationAsync(notifId(reminderId)).catch(
      () => {},
    );

    await Notifications.scheduleNotificationAsync({
      identifier: notifId(reminderId),
      content: {
        title: i18n.t('notif.title'),
        body: i18n.t('notif.body', { name: habitName }),
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL : undefined,
      },
    });
    await dumpScheduled(`scheduled reminder ${reminderId} @ ${hour}:${minute}`);
  },

  async cancelReminder(reminderId: number): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notifId(reminderId)).catch(
      () => {},
    );
    await dumpScheduled(`cancelled reminder ${reminderId}`);
  },

  // Cancela TODAS las notificaciones programadas en el sistema.
  // Útil al arrancar tras migraciones para eliminar identifiers huérfanos.
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  },

  async dumpScheduled(label = 'startup') {
    await dumpScheduled(label);
  },
};
