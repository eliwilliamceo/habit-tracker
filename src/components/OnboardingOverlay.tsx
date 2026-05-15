import React from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { ChevronRight, Link2, Flame } from "lucide-react-native";
import { ThemeColors } from "../theme/colors";
import { useThemeColors } from "../theme/useTheme";
import { Logo } from "./Logo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FADE_OUT_MS = 320;

type Slide = {
  key: "slide1" | "slide2" | "slide3";
  icon: (color: string) => React.ReactNode;
};

const SLIDES: Slide[] = [
  { key: "slide1", icon: () => <Logo size={120} /> },
  {
    key: "slide2",
    icon: (color) => <Link2 size={72} color={color} strokeWidth={1.5} />,
  },
  {
    key: "slide3",
    icon: (color) => (
      <Flame size={72} color={color} fill={color} strokeWidth={1.5} />
    ),
  },
];

type Props = {
  onFinish: () => void;
};

export const OnboardingOverlay = ({ onFinish }: Props) => {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t } = useTranslation();

  const [index, setIndex] = React.useState(0);
  const listRef = React.useRef<FlatList<Slide>>(null);
  const opacity = useSharedValue(1);
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isLast = index === SLIDES.length - 1;

  const dismiss = React.useCallback(() => {
    opacity.value = withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
      if (finished) runOnJS(onFinish)();
    });
  }, [opacity, onFinish]);

  const handleNext = () => {
    if (isLast) {
      dismiss();
    } else {
      listRef.current?.scrollToIndex({
        index: index + 1,
        animated: true,
      });
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (newIndex !== index) setIndex(newIndex);
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.container, overlayStyle]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={dismiss} hitSlop={12}>
          <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item, index: i }) => (
          <SlideView slide={item} t={t} styles={styles} colors={colors} active={i === index} />
        )}
      />

      <View style={styles.bottomBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index ? styles.dotActive : null,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {t(isLast ? "onboarding.start" : "onboarding.next")}
          </Text>
          <ChevronRight size={20} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const SlideView = ({
  slide,
  t,
  styles,
  colors,
}: {
  slide: Slide;
  t: (k: string) => string;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
  active: boolean;
}) => (
  <View style={styles.slide}>
    <View style={styles.iconWrap}>{slide.icon(colors.primary)}</View>
    <Text style={styles.title}>{t(`onboarding.${slide.key}.title`)}</Text>
    <Text style={styles.body}>{t(`onboarding.${slide.key}.body`)}</Text>
  </View>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingTop: 60,
      paddingBottom: 40,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    skipText: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    slide: {
      width: SCREEN_WIDTH,
      paddingHorizontal: 36,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    iconWrap: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 36,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.textMain,
      textAlign: "center",
      letterSpacing: -0.4,
      marginBottom: 14,
    },
    body: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      maxWidth: 340,
    },
    bottomBar: {
      paddingHorizontal: 24,
      paddingTop: 24,
      gap: 24,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },
    nextBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
    },
    nextText: {
      color: "white",
      fontSize: 17,
      fontWeight: "700",
    },
  });
