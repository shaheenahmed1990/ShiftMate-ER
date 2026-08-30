cat > src/pages/Settings.jsx <<'EOF'
import React from 'react'
import { Globe2, Moon, Sun, Database } from 'lucide-react'
import { useApp } from '../hooks/useApp'

export default function Settings() {
  const { ui, lang, setLang, dark, setDark } = useApp()

  return (
    <div className={`flex-1 overflow-y-auto ${ui.bg} ${ui.text}`}>
      <div className="mx-auto w-full max-w-5xl p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ui.card}`}
            >
              <Database size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'الإعدادات' : 'Settings'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'تخصيص التطبيق وإعداداته'
                  : 'Customize your application settings'}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">

          {/* Language */}
          <section className={`rounded-2xl p-6 ${ui.card}`}>
            <div className="mb-5">
              <h2 className="text-base font-semibold">
                {lang === 'ar' ? 'اللغة' : 'Language'}
              </h2>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'اختر لغة واجهة التطبيق.'
                  : 'Choose the application interface language.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
                  lang === 'ar'
                    ? 'border-white/30 bg-white/10'
                    : `${ui.divider} hover:bg-white/5`
                }`}
              >
                <Globe2 size={20} />

                <div>
                  <div className="font-medium">العربية</div>
                  <div className={`text-xs ${ui.sub}`}>
                    Arabic
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLang('en')}
                className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${
                  lang === 'en'
                    ? 'border-white/30 bg-white/10'
                    : `${ui.divider} hover:bg-white/5`
                }`}
              >
                <Globe2 size={20} />

                <div>
                  <div className="font-medium">English</div>
                  <div className={`text-xs ${ui.sub}`}>
                    English
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Appearance */}
          <section className={`rounded-2xl p-6 ${ui.card}`}>
            <div className="mb-5">
              <h2 className="text-base font-semibold">
                {lang === 'ar' ? 'المظهر' : 'Appearance'}
              </h2>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'إعدادات مظهر التطبيق.'
                  : 'Application appearance settings.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDark(!dark)}
              aria-pressed={dark}
              className={`flex w-full items-center gap-3 rounded-xl p-4 text-left transition ${ui.cardSolid} ${ui.hoverCard}`}
            >
              {dark ? <Moon size={20} /> : <Sun size={20} />}

              <div className="flex-1">
                <div className="text-sm font-medium">
                  {dark
                    ? lang === 'ar'
                      ? 'الوضع الداكن'
                      : 'Dark mode'
                    : lang === 'ar'
                      ? 'الوضع الفاتح'
                      : 'Light mode'}
                </div>

                <div className={`mt-1 text-xs ${ui.sub}`}>
                  {dark
                    ? lang === 'ar'
                      ? 'المظهر الداكن مفعل حاليًا'
                      : 'Dark theme is currently active'
                    : lang === 'ar'
                      ? 'المظهر الفاتح مفعل حاليًا'
                      : 'Light theme is currently active'}
                </div>
              </div>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  dark ? 'bg-white/10' : 'bg-slate-100'
                }`}
              >
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </div>
            </button>
          </section>

          {/* Data */}
          <section className={`rounded-2xl p-6 ${ui.card}`}>
            <div className="mb-5">
              <h2 className="text-base font-semibold">
                {lang === 'ar' ? 'البيانات' : 'Data'}
              </h2>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'معلومات حول تخزين بيانات ShiftMate ER.'
                  : 'Information about ShiftMate ER data storage.'}
              </p>
            </div>

            <div className={`rounded-xl p-4 ${ui.cardSolid}`}>
              <div className="flex items-start gap-3">
                <Database size={20} className="mt-0.5 shrink-0" />

                <div>
                  <div className="text-sm font-medium">
                    {lang === 'ar'
                      ? 'التخزين المحلي'
                      : 'Local storage'}
                  </div>

                  <p className={`mt-1 text-xs leading-5 ${ui.sub}`}>
                    {lang === 'ar'
                      ? 'يتم تخزين بيانات التطبيق محليًا على هذا الجهاز.'
                      : 'Application data is stored locally on this device.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div className={`mt-6 text-xs ${ui.faint}`}>
          ShiftMate ER
        </div>
      </div>
    </div>
  )
}
EOF
