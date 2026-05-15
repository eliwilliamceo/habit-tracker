import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { es } from "./locales/es";
import { en } from "./locales/en";

// Detecta el idioma del SO al arrancar. Si no es ES ni EN, cae a ES.
const deviceLanguage = getLocales()[0]?.languageCode ?? "es";
const supported = ["es", "en"];
const initial = supported.includes(deviceLanguage) ? deviceLanguage : "es";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: initial,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false, // React ya escapa
  },
  // react-i18next siempre devuelve string si la clave existe
  returnNull: false,
});

export default i18n;
