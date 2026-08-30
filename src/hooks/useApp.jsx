import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translate } from '../i18n'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('sme_lang') || 'en')
  const [dark, setDarkState] = useState(() => (localStorage.getItem('sme_theme') || 'dark') === 'dark')

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l) => {
    setLangState(l)
    localStorage.setItem('sme_lang', l)
  }, [])

  const setDark = useCallback((d) => {
    setDarkState(d)
    localStorage.setItem('sme_theme', d ? 'dark' : 'light')
  }, [])

  const t = useCallback((key) => translate(lang, key), [lang])

  const ui = dark ? {
    bg: 'bg-[#070b12]',
    text: 'text-white',
    sub: 'text-white/55',
    faint: 'text-white/35',
    card: 'bg-white/[0.06] border border-white/10 backdrop-blur-sm',
    cardSolid: 'bg-[#0d1420] border border-white/10',
    input: 'bg-white/[0.06] border border-white/15 text-white placeholder-white/30',
    divider: 'border-white/10',
    hoverCard: 'hover:bg-white/[0.09]',
    navBg: 'bg-[#0a0f18]/95 border-white/10',
  } : {
    bg: 'bg-[#f4f6f9]',
    text: 'text-slate-900',
    sub: 'text-slate-500',
    faint: 'text-slate-400',
    card: 'bg-white border border-slate-200 shadow-sm',
    cardSolid: 'bg-white border border-slate-200',
    input: 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400',
    divider: 'border-slate-200',
    hoverCard: 'hover:bg-slate-50',
    navBg: 'bg-white/95 border-slate-200',
  }

  return (
    <AppCtx.Provider value={{ lang, setLang, dark, setDark, t, ui, isRtl: lang === 'ar' }}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
