export const es = {
  common: {
    cancel: "Cancelar",
    delete: "Eliminar",
    optional: "opcional",
  },

  home: {
    greeting: {
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
    },
    progress: "Hoy: {{completed}} de {{total}}",
    anchor: "Después de {{anchor}}",
    hint: "💡 Toca para ver detalle · mantén presionado para eliminar",
    legalLink: "Privacidad · Términos",
    empty: {
      title: "Empieza tu primer hábito",
      subtitle: "Pequeñas acciones diarias se convierten en quien eres.",
      cta: "Crear hábito",
    },
    deleteConfirm: {
      title: "Eliminar hábito",
      message:
        '¿Seguro que quieres eliminar "{{name}}"? Se borrarán también su racha y su recordatorio.',
    },
  },

  create: {
    titleNew: "Nuevo hábito",
    titleEdit: "Editar hábito",
    namePlaceholder: "Ej. Beber 2L de agua",
    anchor: {
      label: "Vincular a una rutina",
      help: "Se te quedará más fácil si lo encadenas a algo que ya haces.",
      prefix: "Después de",
      placeholder: "cepillarme los dientes",
    },
    reminder: {
      label: "Recordatorios",
      multipleHelp: "Puedes elegir varias horas. Toca un chip para añadir o quitar.",
      presets: {
        morning: "Mañana · 7:00",
        noon: "Mediodía · 13:00",
        evening: "Tarde · 19:00",
        night: "Antes de dormir · 22:00",
      },
      add: "Añadir",
      hourPlaceholder: "HH",
      minutePlaceholder: "MM",
      customError: "Hora inválida (00-23 / 00-59)",
      customDup: "Ya añadiste esa hora",
      customHelp: "Hora personalizada · 24h",
    },
    saveNew: "Guardar hábito",
    saveEdit: "Guardar cambios",
  },

  detail: {
    streak_one: "día seguido",
    streak_other: "días seguidos",
    bestStreak: "Mejor racha",
    bestStreakUnit_one: "día",
    bestStreakUnit_other: "días",
    total: "Total",
    totalUnit_one: "vez",
    totalUnit_other: "veces",
    last30Days: "Últimos 30d",
    heatmapTitle: "Últimas 5 semanas",
    weekDays: ["L", "M", "M", "J", "V", "S", "D"],
    configTitle: "Configuración",
    configAnchor: "Después de {{anchor}}",
    configReminder: "Recordatorio diario a las {{time}}",
    configRemindersMultiple: "Recordatorios diarios",
  },

  splash: {
    title: "Hábitos",
    tagline: "Pequeñas acciones, grandes cambios",
  },

  onboarding: {
    skip: "Saltar",
    next: "Siguiente",
    start: "Empezar",
    slide1: {
      title: "Construye hábitos consistentes",
      body: "Una app sencilla, basada en técnicas validadas de psicología del comportamiento.",
    },
    slide2: {
      title: "Engancha cada hábito a una rutina",
      body: "Lo que ya haces es tu mejor recordatorio. Después de cepillarte los dientes. Después del café. Pequeño ancla, cero fricción.",
    },
    slide3: {
      title: "Una racha a la vez",
      body: "Marca cada día cumplido. La cadena se construye sola y tu identidad con ella.",
    },
  },

  notif: {
    title: "⏰ ¡Hora de tu hábito!",
    body: "No olvides completar: {{name}}",
    channelName: "Recordatorios de hábitos",
  },

  legal: {
    title: "Información legal",
    lastUpdated: "Última actualización: {{date}}",
    disclaimer:
      "Este texto es una plantilla inicial. Antes de publicar la app en App Store o Google Play, se recomienda revisarla con un asesor legal según la jurisdicción aplicable.",
    contact: "Contacto: {{email}}",
    privacy: {
      title: "Política de privacidad",
    },
    terms: {
      title: "Términos de uso",
    },
  },
};
