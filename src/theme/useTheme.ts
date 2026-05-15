import { useColorScheme } from "react-native";
import { darkColors, lightColors, ThemeColors } from "./colors";

// Devuelve la paleta activa según la preferencia del SO.
// Cuando el usuario cambia el modo del sistema, RN re-renderiza
// con el nuevo valor automáticamente.
export const useThemeColors = (): ThemeColors => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
};

export const useIsDark = (): boolean => {
  return useColorScheme() === "dark";
};
