import React, { useMemo, useState } from 'react'
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Save,
  X,
} from 'lucide-react'
import { db } from '../lib/db'
import { useLive } from '../lib/useLive'
import { useApp } from '../hooks/useApp'
import { nowIso } from '../timeUtils'

export default function Notes() {
  const { ui, lang } = useApp()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { data: notes, loading } = useLive('notes', {
    order: '-updatedAt',
  })

  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase()

    if (!needle) return notes

    return notes.filter((note) =>
      `${note.title} ${note.content}`.toLowerCase().includes(needle),
    )
  }, [notes, query])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setEditingId(null)
  }

  const saveNote = async (event) => {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanContent = content.trim()

    if (!cleanTitle || !cleanContent || saving) return

    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await db.update('notes', editingId, {
          title: cleanTitle,
          content: cleanContent,
          updatedAt: nowIso(),
        })
      } else {
        await db.insert('notes', {
          title: cleanTitle,
          content: cleanContent,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        })
      }

      resetForm()
    } catch (err) {
      console.error('Failed to save note:', err)
      setError(
        lang === 'ar'
          ? 'تعذر حفظ الملاحظة. حاول مرة أخرى.'
          : 'Unable to save the note. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  const editNote = (note) => {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeNote = async (note) => {
    if (saving) return

    setSaving(true)
    setError('')

    try {
      await db.delete('notes', note.id)

      if (editingId === note.id) {
        resetForm()
      }
    } catch (err) {
      console.error('Failed to delete note:', err)
      setError(
        lang === 'ar'
          ? 'تعذر حذف الملاحظة. حاول مرة أخرى.'
          : 'Unable to delete the note. Please try again.',
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
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">
                {lang === 'ar' ? 'الملاحظات' : 'Notes'}
              </h1>

              <p className={`mt-1 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'دوّن المعلومات المهمة أثناء المناوبة'
                  : 'Capture important information during your shift'}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={saveNote} className="mb-8">
          <div className={`space-y-3 rounded-2xl p-3 ${ui.card}`}>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'عنوان الملاحظة'
                  : 'Note title'
              }
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none ${ui.input}`}
              disabled={saving}
            />

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'اكتب ملاحظتك هنا...'
                  : 'Write your note here...'
              }
              rows={5}
              className={`w-full resize-none rounded-xl px-4 py-3 text-sm leading-6 outline-none ${ui.input}`}
              disabled={saving}
            />

            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition ${ui.cardSolid} ${ui.sub} disabled:opacity-40`}
                >
                  <X size={17} />
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              )}

              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editingId ? (
                  <Save size={18} />
                ) : (
                  <Plus size={18} />
                )}

                {editingId
                  ? lang === 'ar'
                    ? 'حفظ التعديلات'
                    : 'Save changes'
                  : lang === 'ar'
                    ? 'إضافة ملاحظة'
                    : 'Add note'}
              </button>
            </div>
          </div>
        </form>

        {notes.length > 0 && (
          <div className={`mb-6 flex items-center gap-2 rounded-xl px-3 ${ui.input}`}>
            <Search size={17} className={ui.sub} />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'البحث في الملاحظات...'
                  : 'Search notes...'
              }
              className={`min-w-0 flex-1 bg-transparent py-3 text-sm outline-none ${ui.text}`}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className={`rounded-lg p-1 ${ui.sub} hover:bg-white/5`}
                aria-label={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className={`rounded-2xl p-8 ${ui.card}`}>
            <div className={`text-sm ${ui.sub}`}>
              {lang === 'ar'
                ? 'جارٍ تحميل الملاحظات...'
                : 'Loading notes...'}
            </div>
          </div>
        ) : notes.length === 0 ? (
          <section className={`rounded-2xl p-8 ${ui.card}`}>
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <FileText size={28} />
              </div>

              <h2 className="text-xl font-semibold">
                {lang === 'ar'
                  ? 'لا توجد ملاحظات بعد'
                  : 'No notes yet'}
              </h2>

              <p className={`mt-2 max-w-md text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'أضف أول ملاحظة لتسجيل المعلومات المهمة أثناء عملك.'
                  : 'Add your first note to capture important information.'}
              </p>
            </div>
          </section>
        ) : filteredNotes.length === 0 ? (
          <section className={`rounded-2xl p-8 ${ui.card}`}>
            <div className="py-10 text-center">
              <Search
                size={28}
                className={`mx-auto mb-4 ${ui.sub}`}
              />

              <h2 className="text-lg font-semibold">
                {lang === 'ar'
                  ? 'لا توجد نتائج'
                  : 'No results'}
              </h2>

              <p className={`mt-2 text-sm ${ui.sub}`}>
                {lang === 'ar'
                  ? 'جرّب استخدام كلمات بحث مختلفة.'
                  : 'Try a different search term.'}
              </p>
            </div>
          </section>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                className={`group rounded-2xl p-5 transition ${ui.cardSolid}`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium">
                      {note.title}
                    </h2>

                    <p
                      className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${ui.sub}`}
                    >
                      {note.content}
                    </p>

                    <div className={`mt-4 text-xs ${ui.faint}`}>
                      {new Date(note.updatedAt).toLocaleString(
                        lang === 'ar' ? 'ar-SA' : 'en-US',
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => editNote(note)}
                      disabled={saving}
                      className={`rounded-lg px-2.5 py-2 text-xs ${ui.sub} hover:bg-white/5 disabled:opacity-40`}
                    >
                      {lang === 'ar' ? 'تعديل' : 'Edit'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeNote(note)}
                      disabled={saving}
                      aria-label={
                        lang === 'ar'
                          ? 'حذف الملاحظة'
                          : 'Delete note'
                      }
                      className={`rounded-lg p-2 ${ui.sub} hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={`mt-6 text-xs ${ui.faint}`}>
          {lang === 'ar'
            ? 'يتم حفظ الملاحظات محليًا على هذا الجهاز.'
            : 'Notes are stored locally on this device.'}
        </div>
      </div>
    </div>
  )
}
