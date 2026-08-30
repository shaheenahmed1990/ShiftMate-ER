import React, { useState } from 'react'
import { auth } from '../lib/auth'
import { useApp } from '../hooks/useApp'

export default function Login() {
  const { ui, t, lang, setLang } = useApp()
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)

    try {
      await auth.signIn()
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`min-h-full flex items-center justify-center p-6 ${ui.bg} ${ui.text}`}
    >
      <div className={`w-full max-w-md rounded-2xl p-8 ${ui.card}`}>
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className={`rounded-lg px-3 py-2 text-sm ${ui.sub} hover:bg-white/5`}
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        <div className="mb-8">
          <div className="text-3xl font-bold">ShiftMate ER</div>
          <p className={`mt-2 ${ui.sub}`}>
            {t('appName')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full rounded-xl px-4 py-3 bg-white text-black font-medium disabled:opacity-50"
        >
          {loading
            ? 'Signing in...'
            : lang === 'ar'
              ? 'تسجيل الدخول لبدء المناوبة'
              : 'Sign in to start your shift'}
        </button>
      </div>
    </div>
  )
}
