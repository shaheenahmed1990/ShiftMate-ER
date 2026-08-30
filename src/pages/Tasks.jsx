import React, { useMemo, useState } from 'react'
import {
  Check,
  Circle,
  ClipboardList,
  Plus,
  Trash2,
} from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { nowIso } from '../timeUtils'

export default function Tasks() {
  const { ui, lang } = useApp()

  const [newTask, setNewTask] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: tasks, loading } = useLive('tasks', {
    order: '-createdAt',
  })

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'completed'),
    [tasks],
  )

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === 'completed'),
    [tasks],
  )

  const addTask = async (event) => {
    event.preventDefault()

    const title = newTask.trim()
    if (!title || saving) return

    setSaving(true)
    setError('')

    try {
      await db.insert('tasks', {
        title,
        status: 'pending',
        createdAt: nowIso(),
        completedAt: null,
      })

      setNewTask('')
    } catch (err) {
      console.error('Failed to add task:', err)
      setError(
        lang === 'ar'
          ? 'تعذر إضافة المهمة. حاول مرة أخرى.'
          : 'Unable to add the task. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const toggleTask = async (task) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      const completed = task.status !== 'completed'

      await db.update('tasks', task.id, {
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? nowIso() : null,
      })
    } catch (err) {
      console.error('Failed to update task:', err)
      setError(
        lang === 'ar'
          ? 'تعذر تحديث المهمة. حاول مرة أخرى.'
          : 'Unable to update the task. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const removeTask = async (task) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      await db.delete('tasks', task.id)
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError(
        lang === 'ar'
          ? 'تعذر حذف المهمة. حاول مرة أخرى.'
          : 'Unable to delete the task. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const TaskRow = ({ task }) => {
    const completed = task.status === 'completed'

    return (
      <div
        className={`group flex items-center gap-3 rounded-xl p-4 transition ${ui.cardSolid}`}
      >
        <button
          type="button"
          onClick={() => toggleTask(task)}
          disabled={saving}
          aria-label={
            completed
              ? lang === 'ar'
                ? 'إلغاء إكمال المهمة'
                : 'Mark task as pending'
              : lang === 'ar'
                ? 'إكمال المهمة'
                : 'Complete task'
          }
          className="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {completed ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={15} strokeWidth={3} />
            </span>
          ) : (
            <Circle size={24} className={ui.sub} />
          )}
        </button>

        <span
          className={`min-w-0 flex-1 text-sm ${
            completed ? `line-through ${ui.faint}` : ''
          }`}
        >
          {task.title}
        </span>

        <button
          type="button"
          onClick={() => removeTask(task)}
          disabled={saving}
          aria-label={lang === 'ar' ? 'حذف المهمة' : 'Delete task'}
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
              <ClipboardList size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'المهام' : 'Tasks'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'إدارة مهامك أثناء المناوبة'
                  : 'Manage your tasks during the shift'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={addTask} className="mb-6">
          <div className={`flex gap-2 rounded-2xl p-2 ${ui.card}`}>
            <input
              type="text"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'أضف مهمة جديدة...'
                  : 'Add a new task...'
              }
              className={`min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              disabled={saving}
            />

            <button
              type="submit"
              disabled={!newTask.trim() || saving}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">
                {lang === 'ar' ? 'إضافة' : 'Add'}
              </span>
            </button>
          </div>
        </form>

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <div className={`text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'جارٍ تحميل المهام...'
                : 'Loading tasks...'}
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <section className={`rounded-2xl p-8 ${ui.card}`}>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <ClipboardList size={28} />
              </div>

              <h2 className="text-xl font-semibold">
                {lang === 'ar'
                  ? 'لا توجد مهام بعد'
                  : 'No tasks yet'}
              </h2>

              <p className={`mt-2 max-w-md text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'أضف أول مهمة للبدء بتنظيم عملك.'
                  : 'Add your first task to organize your work.'}
              </p>
            </div>
          </section>
        ) : (
          <div className="space-y-8">
            {pendingTasks.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {lang === 'ar' ? 'المهام الحالية' : 'Pending'}
                  </h2>

                  <span className={`text-xs ${ui.sub}`}>
                    {pendingTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )}

            {completedTasks.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    {lang === 'ar' ? 'مكتملة' : 'Completed'}
                  </h2>

                  <span className={`text-xs ${ui.sub}`}>
                    {completedTasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className={`mt-6 text-xs ${ui.faint}`}>
          {lang === 'ar'
            ? 'يتم حفظ المهام محليًا على هذا الجهاز.'
            : 'Tasks are stored locally on this device.'}
        </div>
      </div>
    </div>
  )
}
