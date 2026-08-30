import React from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Plus,
  Stethoscope,
} from 'lucide-react'
import { useApp } from '../hooks/useApp'
import { useLive } from '../lib/useLive'

function StatCard({ icon: Icon, label, value, sub, href, ui }) {
  const content = (
    <div
      className={`rounded-2xl p-4 ${ui.card} ${ui.hoverCard} transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm ${ui.sub}`}>{label}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {value}
          </p>

          {sub && (
            <p className={`mt-1 text-xs ${ui.faint}`}>
              {sub}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white/10 p-2.5">
          <Icon size={19} />
        </div>
      </div>
    </div>
  )

  return href ? <Link to={href}>{content}</Link> : content
}

function EmptyState({ icon: Icon, title, text, action, to, ui }) {
  return (
    <div className={`rounded-2xl p-6 text-center ${ui.card}`}>
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
        <Icon size={20} />
      </div>

      <p className="font-medium">{title}</p>

      <p className={`mt-1 text-sm ${ui.sub}`}>
        {text}
      </p>

      {action && (
        <Link
          to={to}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-85"
        >
          <Plus size={16} />
          {action}
        </Link>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { ui, t, lang } = useApp()

  const { data: cases, loading: casesLoading } = useLive('cases', {
    order: '-createdAt',
    limit: 5,
  })

  const { data: tasks, loading: tasksLoading } = useLive('tasks', {
    order: '-createdAt',
    limit: 5,
  })

  const { data: reminders } = useLive('reminders', {
    order: 'dueAt',
    limit: 5,
  })

  const { data: activeShifts, loading: shiftLoading } = useLive('shifts', {
    filters: { status: 'active' },
    order: '-startedAt',
    limit: 1,
  })

  const activeShift = activeShifts[0] || null

  const activeCases = cases.filter(
    (item) =>
      !['closed', 'completed', 'discharged'].includes(item.status),
  )

  const pendingTasks = tasks.filter(
    (item) => !['done', 'completed'].includes(item.status),
  )

  const pendingReminders = reminders.filter(
    (item) => !['done', 'completed'].includes(item.status),
  )

  const formatDate = (value) => {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat(
      lang === 'ar' ? 'ar-SA' : 'en-US',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(date)
  }

  const displayValue = (item, fields) => {
    for (const field of fields) {
      if (item?.[field]) return item[field]
    }

    return lang === 'ar' ? 'بدون عنوان' : 'Untitled'
  }

  return (
    <div className={`min-h-full overflow-y-auto ${ui.text}`}>
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">

        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-white/10 p-2">
                <Stethoscope size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  ShiftMate ER
                </h1>

                <p className={`text-sm ${ui.sub}`}>
                  {lang === 'ar'
                    ? 'لوحة تحكم قسم الطوارئ'
                    : 'Emergency Department dashboard'}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/cases"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85"
          >
            <Plus size={17} />
            {lang === 'ar' ? 'حالة جديدة' : 'New case'}
          </Link>
        </header>

        {/* Shift status */}
        <section
          className={`mb-6 rounded-2xl p-5 ${ui.card}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  activeShift
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-white/10'
                }`}
              >
                <Activity size={21} />
              </div>

              <div>
                <p className="font-semibold">
                  {shiftLoading
                    ? lang === 'ar'
                      ? 'جارٍ تحميل حالة المناوبة...'
                      : 'Loading shift status...'
                    : activeShift
                      ? lang === 'ar'
                        ? 'المناوبة نشطة'
                        : 'Shift active'
                      : lang === 'ar'
                        ? 'لا توجد مناوبة نشطة'
                        : 'No active shift'}
                </p>

                <p className={`text-sm ${ui.sub}`}>
                  {activeShift
                    ? lang === 'ar'
                      ? 'أنت في المناوبة الآن'
                      : 'You are currently on shift'
                    : lang === 'ar'
                      ? 'ابدأ مناوبتك لتتبع الحالات والمهام'
                      : 'Start a shift to track cases and tasks'}
                </p>
              </div>
            </div>

            <Link
              to="/shift"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
            >
              <Clock3 size={16} />

              {activeShift
                ? lang === 'ar'
                  ? 'عرض المناوبة'
                  : 'View shift'
                : lang === 'ar'
                  ? 'بدء المناوبة'
                  : 'Start shift'}

              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            icon={Activity}
            label={lang === 'ar' ? 'الحالات النشطة' : 'Active cases'}
            value={casesLoading ? '—' : activeCases.length}
            sub={lang === 'ar' ? 'الحالات الحالية' : 'Current cases'}
            href="/cases"
            ui={ui}
          />

          <StatCard
            icon={ClipboardList}
            label={lang === 'ar' ? 'المهام المعلقة' : 'Pending tasks'}
            value={tasksLoading ? '—' : pendingTasks.length}
            sub={lang === 'ar' ? 'تحتاج إلى إجراء' : 'Need action'}
            href="/tasks"
            ui={ui}
          />

          <StatCard
            icon={AlertCircle}
            label={lang === 'ar' ? 'التذكيرات' : 'Reminders'}
            value={pendingReminders.length}
            sub={lang === 'ar' ? 'غير مكتملة' : 'Outstanding'}
            href="/reminders"
            ui={ui}
          />

          <StatCard
            icon={CheckCircle2}
            label={lang === 'ar' ? 'حالات معروضة' : 'Recent cases'}
            value={cases.length}
            sub={lang === 'ar' ? 'آخر الحالات' : 'Latest records'}
            href="/history"
            ui={ui}
          />

        </section>

        {/* Main content */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* Recent cases */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  {lang === 'ar' ? 'أحدث الحالات' : 'Recent cases'}
                </h2>

                <p className={`text-xs ${ui.sub}`}>
                  {lang === 'ar'
                    ? 'آخر الحالات المسجلة'
                    : 'Latest recorded cases'}
                </p>
              </div>

              <Link
                to="/cases"
                className={`text-sm ${ui.sub} hover:underline`}
              >
                {lang === 'ar' ? 'عرض الكل' : 'View all'}
              </Link>
            </div>

            {cases.length === 0 ? (
              <EmptyState
                icon={Activity}
                title={
                  lang === 'ar'
                    ? 'لا توجد حالات بعد'
                    : 'No cases yet'
                }
                text={
                  lang === 'ar'
                    ? 'ابدأ بإضافة أول حالة'
                    : 'Add your first case to get started'
                }
                action={lang === 'ar' ? 'إضافة حالة' : 'Add case'}
                to="/cases"
                ui={ui}
              />
            ) : (
              <div className={`overflow-hidden rounded-2xl ${ui.card}`}>
                {cases.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 p-4 ${
                      index !== cases.length - 1
                        ? `border-b ${ui.divider}`
                        : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {displayValue(item, [
                          'name',
                          'patientName',
                          'title',
                          'chiefComplaint',
                        ])}
                      </p>

                      <p className={`mt-1 text-xs ${ui.sub}`}>
                        {item.createdAt
                          ? formatDate(item.createdAt)
                          : item.status || ''}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs">
                      {item.status || 'active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">
                  {lang === 'ar' ? 'المهام' : 'Tasks'}
                </h2>

                <p className={`text-xs ${ui.sub}`}>
                  {lang === 'ar'
                    ? 'المهام التي تحتاج انتباهك'
                    : 'Tasks requiring your attention'}
                </p>
              </div>

              <Link
                to="/tasks"
                className={`text-sm ${ui.sub} hover:underline`}
              >
                {lang === 'ar' ? 'عرض الكل' : 'View all'}
              </Link>
            </div>

            {tasks.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title={
                  lang === 'ar'
                    ? 'لا توجد مهام'
                    : 'No tasks'
                }
                text={
                  lang === 'ar'
                    ? 'لا توجد مهام مسجلة حاليًا'
                    : 'There are no recorded tasks'
                }
                action={lang === 'ar' ? 'إضافة مهمة' : 'Add task'}
                to="/tasks"
                ui={ui}
              />
            ) : (
              <div className={`overflow-hidden rounded-2xl ${ui.card}`}>
                {tasks.map((item, index) => {
                  const done = ['done', 'completed'].includes(
                    item.status,
                  )

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-4 ${
                        index !== tasks.length - 1
                          ? `border-b ${ui.divider}`
                          : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          done
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-white/10'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            done ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {displayValue(item, [
                            'title',
                            'name',
                            'description',
                          ])}
                        </p>

                        <p className={`mt-1 text-xs ${ui.sub}`}>
                          {item.dueAt
                            ? formatDate(item.dueAt)
                            : item.status || ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </section>

        {/* Footer timestamp */}
        <footer className={`mt-8 text-center text-xs ${ui.faint}`}>
          {t('appName')} · {new Date().getFullYear()}
        </footer>

      </div>
    </div>
  )
}
