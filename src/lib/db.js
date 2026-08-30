const PREFIX = 'shiftmate_er_db_'

function getUserId() {
  const raw = localStorage.getItem('shiftmate_er_user')

  if (!raw) {
    throw new Error('User is not authenticated')
  }

  const user = JSON.parse(raw)

  if (!user?.id) {
    throw new Error('Invalid user session')
  }

  return user.id
}

function storageKey(collection) {
  return `${PREFIX}${getUserId()}_${collection}`
}

function readCollection(collection) {
  try {
    const raw = localStorage.getItem(storageKey(collection))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCollection(collection, data) {
  localStorage.setItem(storageKey(collection), JSON.stringify(data))
}

const listeners = new Map()

function notify(collection, event) {
  const collectionListeners = listeners.get(collection)

  if (!collectionListeners) return

  for (const callback of collectionListeners) {
    callback(event)
  }
}

function matchesFilters(record, filters = {}) {
  return Object.entries(filters).every(([field, condition]) => {
    const value = record[field]

    if (
      condition !== null &&
      typeof condition === 'object' &&
      !Array.isArray(condition)
    ) {
      if ('gte' in condition && !(value >= condition.gte)) return false
      if ('gt' in condition && !(value > condition.gt)) return false
      if ('lte' in condition && !(value <= condition.lte)) return false
      if ('lt' in condition && !(value < condition.lt)) return false
      if ('in' in condition && !condition.in.includes(value)) return false
      return true
    }

    return value === condition
  })
}

function sortRecords(records, order) {
  if (!order) return records

  const descending = order.startsWith('-')
  const field = descending ? order.slice(1) : order

  return [...records].sort((a, b) => {
    const av = a[field]
    const bv = b[field]

    if (av === bv) return 0
    if (av == null) return 1
    if (bv == null) return -1

    const result = av < bv ? -1 : 1
    return descending ? -result : result
  })
}

export const db = {
  async insert(collection, data, id = null) {
    const records = readCollection(collection)

    const record = {
      id: id || crypto.randomUUID(),
      ...data,
    }

    records.push(record)
    writeCollection(collection, records)

    notify(collection, {
      type: 'INSERT',
      data: record,
    })

    return record
  },

  async update(collection, id, data) {
    const records = readCollection(collection)
    const index = records.findIndex((record) => record.id === id)

    if (index === -1) {
      throw new Error(`Record not found: ${collection}/${id}`)
    }

    const updated = {
      ...records[index],
      ...data,
      id,
    }

    records[index] = updated
    writeCollection(collection, records)

    notify(collection, {
      type: 'UPDATE',
      data: updated,
    })

    return updated
  },

  async delete(collection, id) {
    const records = readCollection(collection)
    const index = records.findIndex((record) => record.id === id)

    if (index === -1) return true

    const [deleted] = records.splice(index, 1)
    writeCollection(collection, records)

    notify(collection, {
      type: 'DELETE',
      data: deleted,
    })

    return true
  },

  async select(collection, filters = {}, options = {}) {
    let records = readCollection(collection)

    records = records.filter((record) =>
      matchesFilters(record, filters)
    )

    records = sortRecords(records, options.order)

    if (options.offset) {
      records = records.slice(options.offset)
    }

    if (options.limit) {
      records = records.slice(0, options.limit)
    }

    return records
  },

  async search(collection, query, { fields = [] } = {}) {
    const records = readCollection(collection)

    const needle = String(query ?? '').toLowerCase()

    if (!needle) return records

    return records.filter((record) =>
      fields.some((field) =>
        String(record[field] ?? '')
          .toLowerCase()
          .includes(needle)
      )
    )
  },

  subscribe(collection, callback) {
    if (!listeners.has(collection)) {
      listeners.set(collection, new Set())
    }

    const collectionListeners = listeners.get(collection)
    collectionListeners.add(callback)

    return {
      unsubscribe() {
        collectionListeners.delete(callback)

        if (collectionListeners.size === 0) {
          listeners.delete(collection)
        }
      },
    }
  },
}
