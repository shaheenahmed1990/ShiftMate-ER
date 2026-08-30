import React, { useMemo, useState } from 'react'
import {
  Bell,
  Check,
  Clock3,
  Plus,
  Trash2,
} from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { formatDateTime, nowIso } from '../timeUtils'

function toIsoFromLocalInput(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString()
}

function toLocalInputValue(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)

  return local.toISOString().slice(0, 16)
}

export default function Reminders() {
  const { ui, lang } = useApp()

  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: reminders, loading } = useLive('reminders', {
    order: 'remindAt',
  })

  const pendingReminders = useMemo(
    () => reminders.filter((reminder) => reminder.status !== 'completed'),
    [reminders],
  )

  const completedReminders = useMemo(
    () => reminders.filter((reminder) => reminder.status === 'completed'),
    [reminders],
  )

  const addReminder = async (event) => {
    event.preventDefault()

    const cleanTitle = title.trim()
    const reminderTime = toIsoFromLocalInput(remindAt)

    if (!cleanTitle || !reminderTime || saving) return

    setSaving(true)
    setError('')

    try {
      await db.insert('reminders', {
        title: cleanTitle,
        remindAt: reminderTime,
        status: 'pending',
        createdAt: nowIso(),
        completedAt: null,
      })

      setTitle('')
      setRemindAt('')
    } catch (err) {
      console.error('Failed to add reminder:', err)
      setError(
        lang === 'ar'
          ? 'تعذر إضافة التذكير. حاول مرة أخرى.'
          : 'Unable to add the reminder. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const toggleReminder = async (reminder) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      const completed = reminder.status !== 'completed'

      await db.update('reminders', reminder.id, {
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? nowIso() : null,
      })
    } catch (err) {
      console.error('Failed to update reminder:', err)
      setError(
        lang === 'ar'
          ? 'تعذر تحديث التذكير. حاول مرة أخرى.'
          : 'Unable to update the reminder. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const deleteReminder = async (reminder) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      await db.delete('reminders', reminder.id)
    } catch (err) {
      console.error('Failed to delete reminder:', err)
      setError(
        lang === 'ar'
          ? 'تعذر حذف التذكير. حاول مرة أخرى.'
          : 'Unable to delete the reminder. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const ReminderRow = ({ reminder }) => {
    const completed = reminder.status === 'completed'

    return (
      <div
        className={`group flex items-center gap-3 rounded-xl p-4 transition ${ui.cardSolid}`}
      >
        <button
          type="button"
          onClick={() => toggleReminder(reminder)}
          disabled={saving}
          aria-label={
            completed
              ? lang === 'ar'
                ? 'إلغاء إكمال التذكير'
                : 'Mark reminder as pending'
              : lang === 'ar'
                ? 'إكمال التذكير'
                : 'Complete reminder'
          }
          className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {completed ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={15} strokeWidth={3} />
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20">
              <Bell size={13} className={ui.sub} />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div
            className={`text-sm ${
              completed ? `line-through ${ui.faint}` : ''
            }`}
          >
            {reminder.title}
          </div>

          <div
            className={`mt-1 flex items-center gap-1.5 text-xs ${ui.sub}`}
          >
            <Clock3 size={13} />
            {formatDateTime(reminder.remindAt, lang)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => deleteReminder(reminder)}
          disabled={saving}
          aria-label={lang === 'ar' ? 'حذف التذكير' : 'Delete reminder'}
          className={`shrink-0 rounded-lg p-2 opacity-0 transition group-hover:opacity-100 ${ui.sub} hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className={`flex-1 overflow-y-auto ${ui.bg} ${ui.text}`}>
      <div className="mx-auto w-full max-w-5xl p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ui.card}`}
            >
              <Bell size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'التذكيرات' : 'Reminders'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'تذكيرات مهمة أثناء المناوبة'
                  : 'Important reminders during your shift'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={addReminder} className="mb-6">
          <div className={`space-y-2 rounded-2xl p-3 ${ui.card}`}>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'ما الذي تريد تذكيرك به؟'
                  : 'What do you want to remember?'
              }
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              disabled={saving}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Clock3
                  size={17}
                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${ui.sub}`}
                />

                <input
                  type="datetime-local"
                  value={remindAt}
                  onChange={(event) => setRemindAt(event.target.value)}
                  className={`w-full rounded-xl py-3 pl-10 pr-3 text-sm outline-none ${ui.input}`}
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                disabled={!title.trim() || !remindAt || saving}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={18} />
                {lang === 'ar' ? 'إضافة تذكير' : 'Add reminder'}
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <div className={`text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'جارٍ تحميل التذكيرات...'
                : 'Loading reminders...'}
            </div>
          </div>
        ) : reminders.length === 0 ? (
          <section className={`rounded-2xl p-8 ${ui.card}`}>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <Bell size={28} />
              </div>

              <h2 className="text-xl font-semibold">
                {lang === 'ar'
                  ? 'لا توجد تذكيرات بعد'
                  : 'No reminders yet'}
              </h2>

              <p className={`mt-2 max-w-md text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'أضف تذكيرًا لمتابعة الأمور المهمة أثناء عملك.'
                  : 'Add a reminder for important things during your work.'}
              </p>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            {pendingReminders.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {lang === 'ar' ? 'القادمة' : 'Upcoming'}
                  </h2>

                  <span className={`text-xs ${ui.sub}`}>
                    {pendingReminders.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingReminders.map((reminder) => (
                    <ReminderRow
                      key={reminder.id}
                      reminder={reminder}
                    />
                  ))}
                </div>
              </section>
            )}

            {completedReminders.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {lang === 'ar' ? 'مكتملة' : 'Completed'}
                  </h2>

                  <span className={`text-xs ${ui.sub}`}>
                    {completedReminders.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {completedReminders.map((reminder) => (
                    <ReminderRow
                      key={reminder.id}
                      reminder={reminder}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className={`mt-6 text-xs ${ui.faint}`}>
          {lang === 'ar'
            ? 'يتم حفظ التذكيرات محليًا على هذا الجهاز.'
            : 'Reminders are stored locally on this device.'}
        </div>
      </div>
    </div>
  )
}
