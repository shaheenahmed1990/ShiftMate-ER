import React from 'react'
import { Activity, ClipboardList, Clock3, FileText, Plus, Stethoscope } from 'lucide-react'
import { useApp } from '../hooks/useApp'

const stats = [
  {
    label: 'Active Cases',
    value: '0',
    icon: Activity,
  },
  {
    label: 'Open Tasks',
    value: '0',
    icon: ClipboardList,
  },
  {
    label: 'Reminders',
    value: '0',
    icon: Clock3,
  },
  {
    label: 'Handover Items',
    value: '0',
    icon: FileText,
  },
]

export default function Dashboard() {
  const { ui, lang } = useApp()

  const isArabic = lang === 'ar'

  return (
    <section className={`min-h-full overflow-y-auto ${ui.bg} ${ui.text}`}>
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={`mb-2 flex items-center gap-2 text-sm ${ui.sub}`}>
              <Stethoscope size={18} />
              <span>
                {isArabic ? 'قسم الطوارئ' : 'Emergency Department'}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isArabic ? 'لوحة المناوبة' : 'Shift Dashboard'}
            </h1>

            <p className={`mt-1 text-sm ${ui.sub}`}>
              {isArabic
                ? 'نظرة سريعة على المناوبة الحالية'
                : 'A quick overview of your current shift'}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <Plus size={17} />
            {isArabic ? 'إضافة حالة' : 'Add Case'}
          </button>
        </header>

        {/* Current shift */}
        <section className={`mb-6 rounded-2xl p-5 ${ui.card}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${ui.faint}`}>
                {isArabic ? 'المناوبة الحالية' : 'Current Shift'}
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                {isArabic ? 'لا توجد مناوبة نشطة' : 'No active shift'}
              </h2>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {isArabic
                  ? 'ابدأ مناوبتك لإدارة الحالات والمهام'
                  : 'Start a shift to manage cases and tasks'}
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
            >
              {isArabic ? 'بدء المناوبة' : 'Start Shift'}
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className={`rounded-2xl p-4 ${ui.card} ${ui.hoverCard} transition`}
            >
              <div className="flex items-center justify-between">
                <span className={ui.sub}>
                  <Icon size={18} />
                </span>
                <span className="text-2xl font-bold">{value}</span>
              </div>

              <p className={`mt-3 text-sm ${ui.sub}`}>
                {isArabic
                  ? {
                      'Active Cases': 'الحالات النشطة',
                      'Open Tasks': 'المهام المفتوحة',
                      Reminders: 'التذكيرات',
                      'Handover Items': 'عناصر التسليم',
                    }[label]
                  : label}
              </p>
            </article>
          ))}
        </section>

        {/* Empty state */}
        <section className={`mt-6 rounded-2xl p-8 text-center ${ui.card}`}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Activity size={22} />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            {isArabic ? 'جاهز لبدء المناوبة' : 'Ready to start your shift'}
          </h2>

          <p className={`mx-auto mt-2 max-w-md text-sm ${ui.sub}`}>
            {isArabic
              ? 'ستظهر هنا الحالات والمهام والتذكيرات المهمة بمجرد بدء استخدام ShiftMate ER.'
              : 'Cases, tasks, reminders and important handover items will appear here as you use ShiftMate ER.'}
          </p>
        </section>
      </div>
    </section>
  )
}
