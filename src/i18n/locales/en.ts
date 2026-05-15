export const en = {
  common: {
    cancel: "Cancel",
    delete: "Delete",
    optional: "optional",
  },

  home: {
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    progress: "Today: {{completed}} of {{total}}",
    anchor: "After {{anchor}}",
    hint: "💡 Tap to view details · long-press to delete",
    legalLink: "Privacy · Terms",
    empty: {
      title: "Start your first habit",
      subtitle: "Small daily actions become who you are.",
      cta: "Create habit",
    },
    deleteConfirm: {
      title: "Delete habit",
      message:
        'Are you sure you want to delete "{{name}}"? Its streak and reminder will also be removed.',
    },
  },

  create: {
    titleNew: "New habit",
    titleEdit: "Edit habit",
    namePlaceholder: "e.g. Drink 2L of water",
    anchor: {
      label: "Link to an existing routine",
      help: "It's easier to stick if you chain it to something you already do.",
      prefix: "After",
      placeholder: "brushing my teeth",
    },
    reminder: {
      label: "Reminders",
      multipleHelp: "You can pick several times. Tap a chip to add or remove.",
      presets: {
        morning: "Morning · 7:00",
        noon: "Noon · 13:00",
        evening: "Evening · 19:00",
        night: "Before bed · 22:00",
      },
      add: "Add",
      hourPlaceholder: "HH",
      minutePlaceholder: "MM",
      customError: "Invalid time (00-23 / 00-59)",
      customDup: "You already added that time",
      customHelp: "Custom time · 24h",
    },
    saveNew: "Save habit",
    saveEdit: "Save changes",
  },

  detail: {
    streak_one: "day in a row",
    streak_other: "days in a row",
    bestStreak: "Best streak",
    bestStreakUnit_one: "day",
    bestStreakUnit_other: "days",
    total: "Total",
    totalUnit_one: "time",
    totalUnit_other: "times",
    last30Days: "Last 30d",
    heatmapTitle: "Last 5 weeks",
    weekDays: ["M", "T", "W", "T", "F", "S", "S"],
    configTitle: "Settings",
    configAnchor: "After {{anchor}}",
    configReminder: "Daily reminder at {{time}}",
    configRemindersMultiple: "Daily reminders",
  },

  splash: {
    title: "Habits",
    tagline: "Small actions, big changes",
  },

  onboarding: {
    skip: "Skip",
    next: "Next",
    start: "Get started",
    slide1: {
      title: "Build consistent habits",
      body: "A simple app, grounded in proven behavioral psychology techniques.",
    },
    slide2: {
      title: "Anchor each habit to a routine",
      body: "What you already do is your best reminder. After brushing your teeth. After your coffee. Small anchor, zero friction.",
    },
    slide3: {
      title: "One streak at a time",
      body: "Mark each day you show up. The chain builds itself, and your identity with it.",
    },
  },

  notif: {
    title: "⏰ Time for your habit!",
    body: "Don't forget: {{name}}",
    channelName: "Habit reminders",
  },

  legal: {
    title: "Legal information",
    lastUpdated: "Last updated: {{date}}",
    disclaimer:
      "This is a starting template. Before publishing this app on the App Store or Google Play, review it with a legal advisor for your specific jurisdiction.",
    contact: "Contact: {{email}}",
    privacy: {
      title: "Privacy policy",
    },
    terms: {
      title: "Terms of use",
    },
  },
};
