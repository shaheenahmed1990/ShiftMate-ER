import React, { useEffect, useMemo, useState } from 'react'
import { Clock3, LogIn, LogOut, Play, Square } from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { formatDateTime, nowIso } from '../timeUtils'

function formatDuration(startedAt, now) {
  if (!startedAt) return '00:00:00'

  const start = new Date(startedAt).getTime()
  const current = new Date(now).getTime()
  const elapsed = Math.max(0, current - start)

  const totalSeconds = Math.floor(elapsed / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':')
}

export default function Shift() {
  const { ui, lang } = useApp()
  const [now, setNow] = useState(() => new Date())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: activeShifts, loading } = useLive('shifts', {
    filters: { status: 'active' },
    order: '-startedAt',
    limit: 1,
  })

  const activeShift = activeShifts[0] || null

  useEffect(() => {
    if (!activeShift) return undefined

    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [activeShift])

  const duration = useMemo(
    () => formatDuration(activeShift?.startedAt, now),
    [activeShift?.startedAt, now],
  )

  const startShift = async () => {
    if (activeShift || saving) return

    setSaving(true)
    setError('')

    try {
      await db.insert('shifts', {
        status: 'active',
        startedAt: nowIso(),
        endedAt: null,
      })
    } catch (err) {
      console.error('Failed to start shift:', err)
      setError(
        lang === 'ar'
          ? 'تعذر بدء المناوبة. حاول مرة أخرى.'
          : 'Unable to start the shift. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const endShift = async () => {
    if (!activeShift || saving) return

    setSaving(true)
    setError('')

    try {
      await db.update('shifts', activeShift.id, {
        status: 'completed',
        endedAt: nowIso(),
      })
    } catch (err) {
      console.error('Failed to end shift:', err)
      setError(
        lang === 'ar'
          ? 'تعذر إنهاء المناوبة. حاول مرة أخرى.'
          : 'Unable to end the shift. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`flex-1 overflow-y-auto ${ui.bg} ${ui.text}`}>
      <div className="mx-auto w-full max-w-5xl p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ui.card}`}
            >
              <Clock3 size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'المناوبة' : 'Shift'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'إدارة المناوبة الحالية وسجل وقت العمل'
                  : 'Manage your current shift and working time'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <div className={`text-sm ${ui.sub}`}>
              {lang === 'ar' ? 'جارٍ تحميل المناوبة...' : 'Loading shift...'}
            </div>
          </div>
        ) : activeShift ? (
          <section className={`rounded-2xl p-6 md:p-8 ${ui.card}`}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {lang === 'ar' ? 'المناوبة نشطة' : 'Shift active'}
                  </div>

                  <h2 className="text-3xl font-semibold">
                    {lang === 'ar'
                      ? 'أنت في المناوبة الآن'
                      : 'You are on shift'}
                  </h2>

                  <p className={`mt-2 text-sm ${ui.sub}`}>
                    {lang === 'ar'
                      ? 'يمكنك إنهاء المناوبة عند الانتهاء من عملك.'
                      : 'End the shift when your work is complete.'}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`rounded-xl p-5 ${ui.cardSolid}`}>
                  <div className={`mb-2 text-sm ${ui.sub}`}>
                    {lang === 'ar' ? 'بدأت في' : 'Started at'}
                  </div>

                  <div className="text-lg font-medium">
                    {formatDateTime(activeShift.startedAt, lang)}
                  </div>
                </div>

                <div className={`rounded-xl p-5 ${ui.cardSolid}`}>
                  <div className={`mb-2 text-sm ${ui.sub}`}>
                    {lang === 'ar' ? 'مدة المناوبة' : 'Shift duration'}
                  </div>

                  <div className="font-mono text-2xl font-semibold tracking-wide">
                    {duration}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={endShift}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Square size={17} fill="currentColor" />
                {saving
                  ? lang === 'ar'
                    ? 'جارٍ الإنهاء...'
                    : 'Ending shift...'
                  : lang === 'ar'
                    ? 'إنهاء المناوبة'
                    : 'End shift'}
              </button>
            </div>
          </section>
        ) : (
          <section className={`rounded-2xl p-6 md:p-8 ${ui.card}`}>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <LogIn size={28} />
              </div>

              <h2 className="text-2xl font-semibold">
                {lang === 'ar'
                  ? 'لا توجد مناوبة نشطة'
                  : 'No active shift'}
              </h2>

              <p className={`mt-2 max-w-md text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'ابدأ مناوبتك لتتبع الحالات والمهام ووقت العمل.'
                  : 'Start a shift to track cases, tasks, and working time.'}
              </p>

              <button
                type="button"
                onClick={startShift}
                disabled={saving}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={17} fill="currentColor" />
                {saving
                  ? lang === 'ar'
                    ? 'جارٍ البدء...'
                    : 'Starting...'
                  : lang === 'ar'
                    ? 'بدء المناوبة'
                    : 'Start shift'}
              </button>
            </div>
          </section>
        )}

        <div className={`mt-6 flex items-center gap-2 text-xs ${ui.faint}`}>
          <LogOut size={14} />
          {lang === 'ar'
            ? 'سيتم حفظ سجل المناوبة محليًا على هذا الجهاز.'
            : 'Shift records are stored locally on this device.'}
        </div>
      </div>
    </div>
  )
}
