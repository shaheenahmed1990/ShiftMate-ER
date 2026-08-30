export function nowIso() {
  return new Date().toISOString()
}

export function addMinutesIso(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export function isOverdue(value) {
  if (!value) return false
  return new Date(value).getTime() < Date.now()
}

export function formatDateTime(value, locale = 'en') {
  if (!value) return ''
  
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
