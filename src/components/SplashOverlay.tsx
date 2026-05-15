import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";
import { useThemeColors } from "../theme/useTheme";

const HOLD_MS = 2000; // tiempo que el splash queda visible antes del fade-out
const FADE_OUT_MS = 550;

type Props = {
  onFinish: () => void;
};

export const SplashOverlay = ({ onFinish }: Props) => {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const overlayOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(8);

  React.useEffect(() => {
    // Entrada: el logo escala con spring + fade in
    logoOpacity.value = withTiming(1, { duration: 350 });
    logoScale.value = withSpring(1, { damping: 11, stiffness: 130 });
    // El texto entra con leve retraso desde abajo
    textOpacity.value = withDelay(280, withTiming(1, { duration: 420 }));
    textTranslate.value = withDelay(280, withSpring(0, { damping: 14 }));

    // Salida: fade-out total después del HOLD; al terminar avisa al padre.
    overlayOpacity.value = withDelay(
      HOLD_MS,
      withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [logoOpacity, logoScale, overlayOpacity, textOpacity, textTranslate, onFinish]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        styles.container,
        { backgroundColor: colors.background },
        overlayStyle,
      ]}
    >
      <Animated.View style={logoStyle}>
        <Logo size={120} />
      </Animated.View>
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={[styles.title, { color: colors.textMain }]}>
          {t("splash.title")}
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          {t("splash.tagline")}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  textBlock: {
    marginTop: 28,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  },
});
