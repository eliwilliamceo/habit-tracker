import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ThemeColors } from "../theme/colors";
import { useThemeColors } from "../theme/useTheme";

const LAST_UPDATED_ES = "9 de mayo de 2026";
const LAST_UPDATED_EN = "May 9, 2026";
const CONTACT_EMAIL = "eliwilliamceo@gmail.com";

type Section = { title: string; body: string };

const PRIVACY_ES: Section[] = [
  {
    title: "1. Resumen",
    body:
      "Esta aplicación almacena tus datos exclusivamente en tu dispositivo. No tenemos servidores que sepan quién eres ni qué hábitos sigues. No vendemos, alquilamos ni compartimos información personal con terceros.",
  },
  {
    title: "2. Datos que NO recopilamos",
    body:
      "No te pedimos nombre, correo, teléfono, ubicación ni ningún identificador personal para usar la app. No usamos cookies, fingerprinting ni redes publicitarias.",
  },
  {
    title: "3. Datos almacenados localmente",
    body:
      "Los hábitos que creas, las marcas de cumplimiento (check-ins) y los recordatorios se guardan en una base de datos SQLite dentro del almacenamiento privado de tu dispositivo. Esa información nunca sale del teléfono mientras no actives funciones de sincronización (no disponibles en esta versión).",
  },
  {
    title: "4. Reporte de errores (opcional)",
    body:
      "Si el desarrollador habilita Sentry, la app puede enviar diagnósticos técnicos anónimos cuando ocurre un error (versión del sistema, tipo de fallo, traza del código). Estos diagnósticos no incluyen el contenido de tus hábitos ni datos personales. Si no se configura Sentry, no se envía nada.",
  },
  {
    title: "5. Notificaciones",
    body:
      "Los recordatorios son notificaciones locales programadas por el sistema operativo del dispositivo. No pasan por ningún servidor externo. Puedes desactivarlas en cualquier momento desde los ajustes del sistema.",
  },
  {
    title: "6. Menores",
    body:
      "Esta aplicación no está dirigida a menores de 13 años. No recopilamos intencionalmente datos de menores. Si crees que un menor está usando la app, contacta al desarrollador y será atendido.",
  },
  {
    title: "7. Cambios a esta política",
    body:
      "Si en el futuro añadimos cuentas, sincronización en la nube, pagos o análisis, actualizaremos esta política y te lo comunicaremos dentro de la app antes de que los cambios tengan efecto.",
  },
  {
    title: "8. Contacto",
    body: `Si tienes preguntas, escribe a ${CONTACT_EMAIL}.`,
  },
];

const PRIVACY_EN: Section[] = [
  {
    title: "1. Summary",
    body:
      "This app stores your data exclusively on your device. We have no servers that know who you are or what habits you track. We do not sell, rent, or share personal information with third parties.",
  },
  {
    title: "2. Data we do NOT collect",
    body:
      "We do not ask for your name, email, phone, location, or any personal identifier to use the app. We do not use cookies, fingerprinting, or advertising networks.",
  },
  {
    title: "3. Data stored locally",
    body:
      "The habits you create, check-ins, and reminders are stored in a SQLite database inside your device's private storage. That information never leaves your phone unless you enable sync features (not available in this version).",
  },
  {
    title: "4. Error reporting (optional)",
    body:
      "If the developer enables Sentry, the app may send anonymous technical diagnostics when an error occurs (system version, error type, code trace). These diagnostics do not include your habit content or personal data. If Sentry is not configured, nothing is sent.",
  },
  {
    title: "5. Notifications",
    body:
      "Reminders are local notifications scheduled by your device's operating system. They do not go through any external server. You can disable them anytime from your system settings.",
  },
  {
    title: "6. Minors",
    body:
      "This app is not directed at children under 13. We do not intentionally collect data from minors. If you believe a minor is using the app, contact the developer and it will be addressed.",
  },
  {
    title: "7. Changes to this policy",
    body:
      "If we add accounts, cloud sync, payments, or analytics in the future, we will update this policy and notify you in-app before the changes take effect.",
  },
  {
    title: "8. Contact",
    body: `If you have questions, write to ${CONTACT_EMAIL}.`,
  },
];

const TERMS_ES: Section[] = [
  {
    title: "1. Aceptación",
    body:
      "Al usar esta aplicación aceptas estos términos. Si no estás de acuerdo, por favor no la uses.",
  },
  {
    title: "2. Descripción del servicio",
    body:
      "Habit Tracker es una herramienta personal para registrar y mantener hábitos diarios. Se ofrece tal cual, sin garantías de ningún tipo, expresas o implícitas.",
  },
  {
    title: "3. Uso aceptable",
    body:
      "Te comprometes a usar la app únicamente para fines lícitos y personales. No intentes alterar, descompilar ni acceder de manera no autorizada al código o a los datos de otros usuarios (cuando existan funciones multi-usuario).",
  },
  {
    title: "4. Propiedad intelectual",
    body:
      "El código fuente, el diseño y la marca de la aplicación son propiedad del desarrollador. El contenido que tú creas (nombres de hábitos, anclas, recordatorios) te pertenece.",
  },
  {
    title: "5. Limitación de responsabilidad",
    body:
      "Esta app es una herramienta de bienestar personal. No reemplaza consejos médicos, psicológicos ni profesionales. El desarrollador no se hace responsable por decisiones tomadas con base en la información mostrada por la app, ni por pérdidas de datos derivadas de fallos del dispositivo, del sistema operativo o de la propia aplicación.",
  },
  {
    title: "6. Suscripciones y pagos",
    body:
      "Actualmente la aplicación es gratuita. Cuando se añadan compras dentro de la app o suscripciones, los términos específicos (precios, renovación, reembolsos) se mostrarán antes de la compra y se regirán también por las políticas de la tienda (App Store o Google Play).",
  },
  {
    title: "7. Cambios a los términos",
    body:
      "El desarrollador puede modificar estos términos. Si los cambios son sustanciales, te lo comunicaremos dentro de la app.",
  },
  {
    title: "8. Ley aplicable",
    body:
      "Estos términos se interpretarán conforme a la legislación del país de residencia del desarrollador, sin perjuicio de las protecciones que la legislación local del usuario pueda otorgar.",
  },
  {
    title: "9. Contacto",
    body: `Si tienes preguntas, escribe a ${CONTACT_EMAIL}.`,
  },
];

const TERMS_EN: Section[] = [
  {
    title: "1. Acceptance",
    body:
      "By using this app you accept these terms. If you do not agree, please do not use it.",
  },
  {
    title: "2. Service description",
    body:
      "Habit Tracker is a personal tool for logging and maintaining daily habits. It is provided as-is, without warranties of any kind, express or implied.",
  },
  {
    title: "3. Acceptable use",
    body:
      "You agree to use the app only for lawful and personal purposes. Do not attempt to alter, decompile, or access in unauthorized ways the code or data of other users (when multi-user features exist).",
  },
  {
    title: "4. Intellectual property",
    body:
      "The source code, design, and brand of the application are property of the developer. Content you create (habit names, anchors, reminders) belongs to you.",
  },
  {
    title: "5. Limitation of liability",
    body:
      "This app is a personal wellness tool. It does not replace medical, psychological, or professional advice. The developer is not responsible for decisions made based on information shown by the app, nor for data loss caused by device failure, the operating system, or the app itself.",
  },
  {
    title: "6. Subscriptions and payments",
    body:
      "Currently the app is free. When in-app purchases or subscriptions are added, the specific terms (pricing, renewal, refunds) will be shown before purchase and will also be governed by store policies (App Store or Google Play).",
  },
  {
    title: "7. Changes to terms",
    body:
      "The developer may modify these terms. If changes are substantial, we will notify you in-app.",
  },
  {
    title: "8. Governing law",
    body:
      "These terms shall be interpreted according to the laws of the developer's country of residence, without prejudice to protections that the user's local legislation may grant.",
  },
  {
    title: "9. Contact",
    body: `If you have questions, write to ${CONTACT_EMAIL}.`,
  },
];

export default function LegalScreen({ navigation }: any) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const { t, i18n } = useTranslation();

  const isEn = i18n.language.startsWith("en");
  const privacy = isEn ? PRIVACY_EN : PRIVACY_ES;
  const terms = isEn ? TERMS_EN : TERMS_ES;
  const lastUpdated = isEn ? LAST_UPDATED_EN : LAST_UPDATED_ES;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("legal.title")}</Text>
      </View>

      <Text style={styles.lastUpdated}>
        {t("legal.lastUpdated", { date: lastUpdated })}
      </Text>

      <Text style={styles.disclaimer}>{t("legal.disclaimer")}</Text>

      <SectionGroup
        title={t("legal.privacy.title")}
        sections={privacy}
        styles={styles}
      />
      <SectionGroup
        title={t("legal.terms.title")}
        sections={terms}
        styles={styles}
      />

      <Text style={styles.footer}>
        {t("legal.contact", { email: CONTACT_EMAIL })}
      </Text>
    </ScrollView>
  );
}

const SectionGroup = ({
  title,
  sections,
  styles,
}: {
  title: string;
  sections: Section[];
  styles: ReturnType<typeof makeStyles>;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {sections.map((s, i) => (
      <View key={i} style={styles.subsection}>
        <Text style={styles.subsectionTitle}>{s.title}</Text>
        <Text style={styles.body}>{s.body}</Text>
      </View>
    ))}
  </View>
);

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingTop: 60, paddingBottom: 60 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "800",
      color: colors.textMain,
    },

    lastUpdated: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 12,
      fontStyle: "italic",
    },
    disclaimer: {
      fontSize: 13,
      color: colors.textSecondary,
      backgroundColor: colors.surfaceAlt,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 28,
      lineHeight: 19,
    },

    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textMain,
      marginBottom: 14,
      letterSpacing: -0.3,
    },
    subsection: {
      marginBottom: 16,
    },
    subsectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textMain,
      marginBottom: 6,
    },
    body: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 21,
    },

    footer: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },
  });
