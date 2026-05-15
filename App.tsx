import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import './src/i18n';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  Theme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateHabitScreen from './src/screens/CreateHabitScreen';
import HabitDetailScreen from './src/screens/HabitDetailScreen';
import LegalScreen from './src/screens/LegalScreen';
import { habitService } from './src/services/habitService';
import { notificationService } from './src/services/notificationService';
import { settingsService, SETTING_KEYS } from './src/services/settingsService';
import { useThemeColors, useIsDark } from './src/theme/useTheme';
import { SplashOverlay } from './src/components/SplashOverlay';
import { OnboardingOverlay } from './src/components/OnboardingOverlay';

// Sentry: solo se inicializa si hay DSN en env (.env: EXPO_PUBLIC_SENTRY_DSN=...).
// Sin DSN, todo el código de Sentry es no-op — cero overhead en dev.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    // En dev: traces 0% para no llenar la cuota.
    // En producción: 10% (suficiente para diagnosticar, free-tier friendly).
    tracesSampleRate: __DEV__ ? 0 : 0.1,
    // Captura console.error como breadcrumb sin enviarlos como evento.
    integrations: [],
  });
}

// Evita que Expo oculte el splash nativo automáticamente.
// Lo escondemos manualmente cuando React monta nuestro overlay JS,
// así no hay un parpadeo blanco entre splash nativo → overlay animado.
SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createStackNavigator();

const rescheduleReminders = async () => {
  try {
    // Limpia identifiers huérfanos del sistema (migraciones, recordatorios borrados
    // mientras la app estaba cerrada, etc.) — luego reprogramamos todo desde DB.
    await notificationService.cancelAll();
    const reminders = await habitService.getAllReminders();
    for (const r of reminders) {
      await notificationService.scheduleReminder(r.id, r.name, r.hour, r.minute);
    }
    await notificationService.dumpScheduled('startup');
  } catch (error) {
    console.error('Error rescheduling reminders:', error);
  }
};

function App() {
  const colors = useThemeColors();
  const isDark = useIsDark();
  const [splashDone, setSplashDone] = React.useState(false);
  // null = aún cargando flag; true/false = decisión tomada
  const [onboardingSeen, setOnboardingSeen] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    rescheduleReminders();
    settingsService
      .getBoolean(SETTING_KEYS.onboardingSeen)
      .then(setOnboardingSeen)
      .catch(() => setOnboardingSeen(true)); // ante error, no bloqueamos al usuario
    // Una vez React montó el árbol, el splash JS ya está visible:
    // ocultamos el splash nativo para evitar el flash entre ambos.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleOnboardingFinish = React.useCallback(() => {
    settingsService.setBoolean(SETTING_KEYS.onboardingSeen, true).catch(() => {});
    setOnboardingSeen(true);
  }, []);

  const navTheme: Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textMain,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />
          <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
          <Stack.Screen name="Legal" component={LegalScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      {!splashDone && (
        <SplashOverlay onFinish={() => setSplashDone(true)} />
      )}
      {splashDone && onboardingSeen === false && (
        <OnboardingOverlay onFinish={handleOnboardingFinish} />
      )}
    </>
  );
}

// Sentry.wrap envuelve el componente para capturar errores de render
// y conectar el árbol React con el SDK nativo.
export default SENTRY_DSN ? Sentry.wrap(App) : App;
