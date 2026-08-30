import React, { useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  Check,
  ChevronDown,
  ClipboardPlus,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { nowIso } from '../timeUtils'

const priorities = ['low', 'medium', 'high', 'critical']
const statuses = ['waiting', 'active', 'completed']

function priorityLabel(priority, lang) {
  const labels = {
    low: lang === 'ar' ? 'منخفضة' : 'Low',
    medium: lang === 'ar' ? 'متوسطة' : 'Medium',
    high: lang === 'ar' ? 'عالية' : 'High',
    critical: lang === 'ar' ? 'حرجة' : 'Critical',
  }

  return labels[priority] || priority
}

function statusLabel(status, lang) {
  const labels = {
    waiting: lang === 'ar' ? 'انتظار' : 'Waiting',
    active: lang === 'ar' ? 'نشطة' : 'Active',
    completed: lang === 'ar' ? 'مكتملة' : 'Completed',
  }

  return labels[status] || status
}

function priorityClasses(priority) {
  if (priority === 'critical') {
    return 'bg-red-500/10 text-red-400'
  }

  if (priority === 'high') {
    return 'bg-orange-500/10 text-orange-400'
  }

  if (priority === 'medium') {
    return 'bg-yellow-500/10 text-yellow-400'
  }

  return 'bg-sky-500/10 text-sky-400'
}

function statusClasses(status) {
  if (status === 'active') {
    return 'bg-emerald-500/10 text-emerald-400'
  }

  if (status === 'completed') {
    return 'bg-slate-500/10 text-slate-400'
  }

  return 'bg-amber-500/10 text-amber-400'
}

export default function Cases() {
  const { ui, lang } = useApp()

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [patientName, setPatientName] = useState('')
  const [caseNumber, setCaseNumber] = useState('')
  const [priority, setPriority] = useState('medium')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: cases, loading } = useLive('cases', {
    order: '-createdAt',
  })

  const filteredCases = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return cases.filter((item) => {
      const matchesSearch =
        !needle ||
        String(item.patientName || '')
          .toLowerCase()
          .includes(needle) ||
        String(item.caseNumber || '')
          .toLowerCase()
          .includes(needle)

      const matchesPriority =
        priorityFilter === 'all' || item.priority === priorityFilter

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter

      return matchesSearch && matchesPriority && matchesStatus
    })
  }, [cases, search, priorityFilter, statusFilter])

  const addCase = async (event) => {
    event.preventDefault()

    const cleanPatientName = patientName.trim()
    const cleanCaseNumber = caseNumber.trim()

    if (!cleanPatientName || saving) return

    setSaving(true)
    setError('')

    try {
      await db.insert('cases', {
        patientName: cleanPatientName,
        caseNumber:
          cleanCaseNumber ||
          `ER-${String(Date.now()).slice(-6)}`,
        priority,
        status: 'waiting',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      })

      setPatientName('')
      setCaseNumber('')
      setPriority('medium')
    } catch (err) {
      console.error('Failed to add case:', err)
      setError(
        lang === 'ar'
          ? 'تعذر إضافة الحالة. حاول مرة أخرى.'
          : 'Unable to add the case. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (item, status) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      await db.update('cases', item.id, {
        status,
        updatedAt: nowIso(),
      })
    } catch (err) {
      console.error('Failed to update case:', err)
      setError(
        lang === 'ar'
          ? 'تعذر تحديث الحالة. حاول مرة أخرى.'
          : 'Unable to update the case. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const deleteCase = async (item) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      await db.delete('cases', item.id)
    } catch (err) {
      console.error('Failed to delete case:', err)
      setError(
        lang === 'ar'
          ? 'تعذر حذف الحالة. حاول مرة أخرى.'
          : 'Unable to delete the case. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`flex-1 overflow-y-auto ${ui.bg} ${ui.text}`}>
      <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ui.card}`}
            >
              <Activity size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'الحالات' : 'Cases'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'إدارة ومتابعة حالات قسم الطوارئ'
                  : 'Manage and track emergency department cases'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <section className={`mb-6 rounded-2xl p-4 md:p-5 ${ui.card}`}>
          <form onSubmit={addCase}>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardPlus size={18} />
              <h2 className="font-medium">
                {lang === 'ar' ? 'إضافة حالة' : 'Add case'}
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <input
                type="text"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder={
                  lang === 'ar' ? 'اسم المريض' : 'Patient name'
                }
                className={`rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
                disabled={saving}
              />

              <input
                type="text"
                value={caseNumber}
                onChange={(event) => setCaseNumber(event.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'رقم الحالة (اختياري)'
                    : 'Case number (optional)'
                }
                className={`rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
                disabled={saving}
              />

              <div className="relative">
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className={`w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
                  disabled={saving}
                >
                  {priorities.map((value) => (
                    <option key={value} value={value}>
                      {priorityLabel(value, lang)}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${ui.sub}`}
                />
              </div>

              <button
                type="submit"
                disabled={!patientName.trim() || saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ClipboardPlus size={17} />
                {lang === 'ar' ? 'إضافة الحالة' : 'Add case'}
              </button>
            </div>
          </form>
        </section>

        <section className={`mb-6 rounded-2xl p-4 ${ui.card}`}>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${ui.sub}`}
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'ابحث باسم المريض أو رقم الحالة...'
                    : 'Search patient or case number...'
                }
                className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none ${ui.input}`}
              />
            </div>

            <div className="relative md:w-44">
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                className={`w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              >
                <option value="all">
                  {lang === 'ar' ? 'كل الأولويات' : 'All priorities'}
                </option>

                {priorities.map((value) => (
                  <option key={value} value={value}>
                    {priorityLabel(value, lang)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${ui.sub}`}
              />
            </div>

            <div className="relative md:w-44">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className={`w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              >
                <option value="all">
                  {lang === 'ar' ? 'كل الحالات' : 'All statuses'}
                </option>

                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {statusLabel(value, lang)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${ui.sub}`}
              />
            </div>
          </div>
        </section>

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <div className={`text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'جارٍ تحميل الحالات...'
                : 'Loading cases...'}
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <section className={`rounded-2xl p-8 ${ui.card}`}>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <UserRound size={28} />
              </div>

              <h2 className="text-xl font-semibold">
                {cases.length === 0
                  ? lang === 'ar'
                    ? 'لا توجد حالات بعد'
                    : 'No cases yet'
                  : lang === 'ar'
                    ? 'لا توجد نتائج'
                    : 'No results'}
              </h2>

              <p className={`mt-2 max-w-md text-sm ${ui.sub}`}>
                {cases.length === 0
                  ? lang === 'ar'
                    ? 'أضف أول حالة للبدء بمتابعتها.'
                    : 'Add your first case to start tracking it.'
                  : lang === 'ar'
                    ? 'جرّب تغيير معايير البحث أو التصفية.'
                    : 'Try changing your search or filters.'}
              </p>
            </div>
          </section>
        ) : (
          <section className={`overflow-hidden rounded-2xl ${ui.card}`}>
            <div className="divide-y divide-white/10">
              {filteredCases.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-4 p-4 transition md:flex-row md:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {item.patientName}
                      </div>

                      <div className={`mt-1 text-xs ${ui.sub}`}>
                        {item.caseNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${priorityClasses(
                        item.priority,
                      )}`}
                    >
                      {priorityLabel(item.priority, lang)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusClasses(
                        item.status,
                      )}`}
                    >
                      {statusLabel(item.status, lang)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'active' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item, 'active')}
                        disabled={saving}
                        className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        {lang === 'ar' ? 'تنشيط' : 'Activate'}
                      </button>
                    )}

                    {item.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item, 'completed')}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium transition hover:bg-white/15 disabled:opacity-50"
                      >
                        <Check size={14} />
                        {lang === 'ar' ? 'إكمال' : 'Complete'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteCase(item)}
                      disabled={saving}
                      aria-label={
                        lang === 'ar' ? 'حذف الحالة' : 'Delete case'
                      }
                      className="rounded-lg p-2 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={`mt-6 text-xs ${ui.faint}`}>
          {lang === 'ar'
            ? `إجمالي الحالات: ${cases.length} • المعروضة: ${filteredCases.length}`
            : `Total cases: ${cases.length} • Showing: ${filteredCases.length}`}
        </div>
      </div>
    </div>
  )
}
