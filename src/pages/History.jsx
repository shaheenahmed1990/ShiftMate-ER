import React, { useMemo } from 'react'
import { CalendarClock, Clock3, History as HistoryIcon } from 'lucide-react'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { formatDateTime } from '../timeUtils'

function formatDuration(startedAt, endedAt) {
  if (!startedAt) return '00:00:00'

  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return '00:00:00'
  }

  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':')
}

export default function History() {
  const { ui, lang } = useApp()

  const { data: shifts, loading } = useLive('shifts', {
    order: '-startedAt',
  })

  const completedShifts = useMemo(
    () => shifts.filter((shift) => shift.status === 'completed'),
    [shifts],
  )

  const totalDuration = useMemo(() => {
    const seconds = completedShifts.reduce((total, shift) => {
      const start = new Date(shift.startedAt).getTime()
      const end = new Date(shift.endedAt).getTime()

      if (Number.isNaN(start) || Number.isNaN(end)) return total

      return total + Math.max(0, Math.floor((end - start) / 1000))
    }, 0)

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${hours}h ${String(minutes).padStart(2, '0')}m`
  }, [completedShifts])

  return (
    <div className={`flex-1 overflow-y-auto ${ui.bg} ${ui.text}`}>
      <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ui.card}`}
            >
              <HistoryIcon size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'السجل' : 'History'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'مراجعة المناوبات السابقة ومدة العمل'
                  : 'Review previous shifts and working time'}
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className={`rounded-2xl p-5 ${ui.card}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <CalendarClock size={19} />
              </div>

              <div>
                <div className={`text-sm ${ui.sub}`}>
                  {lang === 'ar'
                    ? 'المناوبات المكتملة'
                    : 'Completed shifts'}
                </div>

                <div className="mt-1 text-2xl font-semibold">
                  {completedShifts.length}
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-5 ${ui.card}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Clock3 size={19} />
              </div>

              <div>
                <div className={`text-sm ${ui.sub}`}>
                  {lang === 'ar' ? 'إجمالي وقت العمل' : 'Total work time'}
                </div>

                <div className="mt-1 font-mono text-2xl font-semibold">
                  {totalDuration}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <p className={`text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'جارٍ تحميل السجل...'
                : 'Loading history...'}
            </p>
          </div>
        ) : completedShifts.length === 0 ? (
          <section className={`rounded-2xl p-10 text-center ${ui.card}`}>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <HistoryIcon size={28} />
            </div>

            <h2 className="text-xl font-semibold">
              {lang === 'ar'
                ? 'لا توجد مناوبات سابقة'
                : 'No completed shifts'}
            </h2>

            <p className={`mx-auto mt-2 max-w-md text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'بعد إنهاء أول مناوبة ستظهر تفاصيلها هنا.'
                : 'Your completed shifts will appear here after you finish them.'}
            </p>
          </section>
        ) : (
          <section className={`overflow-hidden rounded-2xl ${ui.card}`}>
            <div className={`border-b px-5 py-4 ${ui.divider}`}>
              <h2 className="font-semibold">
                {lang === 'ar' ? 'المناوبات السابقة' : 'Previous shifts'}
              </h2>
            </div>

            <div className="divide-y divide-white/10">
              {completedShifts.map((shift) => (
                <article key={shift.id} className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />

                        <span className="text-sm font-medium">
                          {lang === 'ar'
                            ? 'مناوبة مكتملة'
                            : 'Completed shift'}
                        </span>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <div className={`mb-1 text-xs ${ui.sub}`}>
                            {lang === 'ar' ? 'بدأت في' : 'Started'}
                          </div>

                          <div>
                            {formatDateTime(shift.startedAt, lang)}
                          </div>
                        </div>

                        <div>
                          <div className={`mb-1 text-xs ${ui.sub}`}>
                            {lang === 'ar' ? 'انتهت في' : 'Ended'}
                          </div>

                          <div>
                            {formatDateTime(shift.endedAt, lang)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`rounded-xl px-4 py-3 ${ui.cardSolid}`}>
                      <div className={`mb-1 text-xs ${ui.sub}`}>
                        {lang === 'ar' ? 'المدة' : 'Duration'}
                      </div>

                      <div className="font-mono text-lg font-semibold">
                        {formatDuration(shift.startedAt, shift.endedAt)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className={`mt-6 text-xs ${ui.faint}`}>
          {lang === 'ar'
            ? 'يتم الاحتفاظ بسجل المناوبات محليًا على هذا الجهاز.'
            : 'Shift history is stored locally on this device.'}
        </div>
      </div>
    </div>
  )
}
