const translations = {
  en: {
    appName: 'ShiftMate ER',
  },
  ar: {
    appName: 'ShiftMate ER',
  },
}

export function translate(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key
}

export default translations
