import React, { useMemo, useState } from 'react'
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Check,
  UserRound,
  AlertTriangle,
  Clock3,
} from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { nowIso } from '../timeUtils'

export default function Handover() {
  const { ui, lang } = useApp()

  const [patient, setPatient] = useState('')
  const [summary, setSummary] = useState('')
  const [priority, setPriority] = useState('normal')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: handovers, loading } = useLive('handovers', {
    order: '-createdAt',
  })

  const pending = useMemo(
    () => handovers.filter((item) => item.status !== 'completed'),
    [handovers],
  )

  const completed = useMemo(
    () => handovers.filter((item) => item.status === 'completed'),
    [handovers],
  )

  const addHandover = async (event) => {
    event.preventDefault()

    const cleanPatient = patient.trim()
    const cleanSummary = summary.trim()

    if (!cleanPatient || !cleanSummary || saving) return

    setSaving(true)
    setError('')

    try {
      await db.insert('handovers', {
        patient: cleanPatient,
        summary: cleanSummary,
        priority,
        status: 'pending',
        createdAt: nowIso(),
        completedAt: null,
      })

      setPatient('')
      setSummary('')
      setPriority('normal')
    } catch (err) {
      console.error('Failed to add handover:', err)
      setError(
        lang === 'ar'
          ? 'تعذر إضافة التسليم. حاول مرة أخرى.'
          : 'Unable to add the handover. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const toggleHandover = async (item) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      const completed = item.status !== 'completed'

      await db.update('handovers', item.id, {
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? nowIso() : null,
      })
    } catch (err) {
      console.error('Failed to update handover:', err)
      setError(
        lang === 'ar'
          ? 'تعذر تحديث التسليم. حاول مرة أخرى.'
          : 'Unable to update the handover. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const removeHandover = async (item) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      await db.delete('handovers', item.id)
    } catch (err) {
      console.error('Failed to delete handover:', err)
      setError(
        lang === 'ar'
          ? 'تعذر حذف التسليم. حاول مرة أخرى.'
          : 'Unable to delete the handover. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const HandoverRow = ({ item }) => {
    const isCompleted = item.status === 'completed'

    const priorityLabel =
      item.priority === 'urgent'
        ? lang === 'ar'
          ? 'عاجل'
          : 'Urgent'
        : lang === 'ar'
          ? 'عادي'
          : 'Normal'

    return (
      <div
        className={`group rounded-2xl p-4 transition ${ui.cardSolid}`}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => toggleHandover(item)}
            disabled={saving}
            aria-label={
              isCompleted
                ? lang === 'ar'
                  ? 'إلغاء إكمال التسليم'
                  : 'Mark handover as pending'
                : lang === 'ar'
                  ? 'إكمال التسليم'
                  : 'Complete handover'
            }
            className="mt-0.5 shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompleted ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={15} strokeWidth={3} />
              </span>
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20">
                <span className="h-2 w-2 rounded-full bg-white/40" />
              </span>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`text-sm font-medium ${
                  isCompleted ? `line-through ${ui.faint}` : ''
                }`}
              >
                {item.patient}
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  item.priority === 'urgent'
                    ? 'bg-red-500/10 text-red-400'
                    : `${ui.faint} bg-white/5`
                }`}
              >
                {priorityLabel}
              </span>
            </div>

            <p
              className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
                isCompleted ? ui.faint : ui.sub
              }`}
            >
              {item.summary}
            </p>

            <div
              className={`mt-3 flex items-center gap-1.5 text-xs ${ui.faint}`}
            >
              <Clock3 size={13} />
              {new Date(item.createdAt).toLocaleString(
                lang === 'ar' ? 'ar-SA' : 'en-US',
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => removeHandover(item)}
            disabled={saving}
            aria-label={
              lang === 'ar' ? 'حذف التسليم' : 'Delete handover'
            }
            className={`shrink-0 rounded-lg p-2 opacity-0 transition group-hover:opacity-100 ${ui.sub} hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed`}
          >
            <Trash2 size={16} />
          </button>
        </div>
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
              <ClipboardCheck size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'التسليم' : 'Handover'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'نظّم الحالات والمعلومات المهمة للمناوبة التالية'
                  : 'Organize important cases for the next shift'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={addHandover} className="mb-8">
          <div className={`space-y-3 rounded-2xl p-3 ${ui.card}`}>
            <div className="relative">
              <UserRound
                size={17}
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${ui.sub}`}
              />

              <input
                type="text"
                value={patient}
                onChange={(event) => setPatient(event.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'المريض / رقم الحالة'
                    : 'Patient / case identifier'
                }
                className={`w-full rounded-xl py-3 pl-10 pr-3 text-sm outline-none ${ui.input}`}
                disabled={saving}
              />
            </div>

            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'ملخص الحالة، الخطة، وما يحتاج المتابعة...'
                  : 'Case summary, plan, and what needs follow-up...'
              }
              rows={4}
              className={`w-full resize-none rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              disabled={saving}
            />

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                disabled={saving}
                className={`rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              >
                <option value="normal">
                  {lang === 'ar' ? 'أولوية عادية' : 'Normal priority'}
                </option>

                <option value="urgent">
                  {lang === 'ar' ? 'عاجل' : 'Urgent'}
                </option>
              </select>

              <button
                type="submit"
                disabled={!patient.trim() || !summary.trim() || saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={18} />
                {lang === 'ar'
                  ? 'إضافة للتسليم'
                  : 'Add to handover'}
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <div className={`text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'جارٍ تحميل التسليم...'
                : 'Loading handover...'}
            </div>
          </div>
        ) : handovers.length === 0 ? (
          <section className={`rounded-2xl p-8 ${ui.card}`}>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <ClipboardCheck size={28} />
              </div>

              <h2 className="text-xl font-semibold">
                {lang === 'ar'
                  ? 'لا توجد حالات للتسليم'
                  : 'No handover items'}
              </h2>

              <p className={`mt-2 max-w-md text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'أضف الحالات المهمة التي تحتاج المناوبة التالية إلى معرفتها.'
                  : 'Add important cases the next shift needs to know about.'}
              </p>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {lang === 'ar' ? 'تحتاج المتابعة' : 'Pending'}
                  </h2>

                  <span className={`text-xs ${ui.sub}`}>
                    {pending.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {pending.map((item) => (
                    <HandoverRow key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {lang === 'ar' ? 'مكتملة' : 'Completed'}
                  </h2>

                  <span className={`text-xs ${ui.sub}`}>
                    {completed.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {completed.map((item) => (
                    <HandoverRow key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className={`mt-6 flex items-center gap-2 text-xs ${ui.faint}`}>
          <AlertTriangle size={13} />
          {lang === 'ar'
            ? 'بيانات التسليم محفوظة محليًا على هذا الجهاز.'
            : 'Handover data is stored locally on this device.'}
        </div>
      </div>
    </div>
  )
}
