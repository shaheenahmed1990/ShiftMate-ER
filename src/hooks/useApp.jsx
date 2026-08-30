import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { translate } from '../i18n'

const AppCtx = createContext(null)

const DARK_UI = {
  bg: 'bg-[#070b12]',
  text: 'text-white',
  sub: 'text-white/60',
  faint: 'text-white/40',

  card: 'bg-white/[0.06] border border-white/10 backdrop-blur-sm',
  cardSolid: 'bg-[#0d1420] border border-white/10',

  input:
    'bg-white/[0.06] border border-white/15 text-white placeholder-white/35',

  divider: 'border-white/10',

  hoverCard: 'hover:bg-white/[0.09]',

  navBg: 'bg-[#0a0f18]/95 border-white/10',

  iconBg: 'bg-white/10',
  iconBgHover: 'hover:bg-white/15',

  buttonSecondary:
    'bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.10]',

  buttonGhost: 'text-white/60 hover:text-white hover:bg-white/[0.06]',

  mutedBg: 'bg-white/[0.04]',
  selectedBg: 'bg-white/10',
  selectedBorder: 'border-white/30',

  overlay: 'bg-black/60',

  modal: 'bg-[#0d1420] border border-white/10',
}

const LIGHT_UI = {
  bg: 'bg-[#f4f6f9]',
  text: 'text-slate-900',
  sub: 'text-slate-500',
  faint: 'text-slate-400',

  card: 'bg-white border border-slate-200 shadow-sm',
  cardSolid: 'bg-white border border-slate-200',

  input:
    'bg-white border border-slate-300 text-slate-900 placeholder-slate-400',

  divider: 'border-slate-200',

  hoverCard: 'hover:bg-slate-50',

  navBg: 'bg-white/95 border-slate-200',

  iconBg: 'bg-slate-100',
  iconBgHover: 'hover:bg-slate-200',

  buttonSecondary:
    'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50',

  buttonGhost:
    'text-slate-500 hover:text-slate-900 hover:bg-slate-100',

  mutedBg: 'bg-slate-50',
  selectedBg: 'bg-slate-100',
  selectedBorder: 'border-slate-300',

  overlay: 'bg-slate-900/40',

  modal: 'bg-white border border-slate-200 shadow-xl',
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('sme_lang') || 'en',
  )

  const [dark, setDarkState] = useState(
    () => (localStorage.getItem('sme_theme') || 'dark') === 'dark',
  )

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  const setLang = useCallback((value) => {
    setLangState(value)
    localStorage.setItem('sme_lang', value)
  }, [])

  const setDark = useCallback((value) => {
    setDarkState(value)
    localStorage.setItem('sme_theme', value ? 'dark' : 'light')
  }, [])

  const t = useCallback(
    (key) => translate(lang, key),
    [lang],
  )

  const ui = dark ? DARK_UI : LIGHT_UI

  return (
    <AppCtx.Provider
      value={{
        lang,
        setLang,
        dark,
        setDark,
        t,
        ui,
        isRtl: lang === 'ar',
      }}
    >
      {children}
    </AppCtx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)

  if (!ctx) {
    throw new Error('useApp must be used within AppProvider')
  }

  return ctx
}
