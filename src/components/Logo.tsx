import React from "react";
import { View } from "react-native";
import { Flame } from "lucide-react-native";
import { useThemeColors } from "../theme/useTheme";

type Props = {
  size?: number;
};

// Logo: cuadrado redondeado primary + flame blanco centrado.
// La llama representa la racha = momentum continuo, el corazón
// psicológico de la app.
export const Logo = ({ size = 96 }: Props) => {
  const colors = useThemeColors();
  const iconSize = Math.round(size * 0.55);
  const radius = Math.round(size * 0.24);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      <Flame
        size={iconSize}
        color="white"
        fill="white"
        strokeWidth={1.5}
      />
    </View>
  );
};
