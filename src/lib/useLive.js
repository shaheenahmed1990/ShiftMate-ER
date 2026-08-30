import { useEffect, useState } from 'react'
import { db } from './db'

export function useLive(collection, options = {}) {
  const {
    filters = {},
    order,
    limit,
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timer = null

    const load = async () => {
      try {
        const result = await db.select(collection, filters, {
          order,
          limit,
        })

        if (mounted) {
          setData(result)
          setLoading(false)
        }
      } catch (error) {
        console.error(`useLive(${collection}) failed:`, error)

        if (mounted) {
          setData([])
          setLoading(false)
        }
      }
    }

    const scheduleReload = () => {
      clearTimeout(timer)

      timer = setTimeout(() => {
        load()
      }, 300)
    }

    setLoading(true)
    load()

    const subscription = db.subscribe(collection, scheduleReload)

    return () => {
      mounted = false
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [
    collection,
    JSON.stringify(filters),
    order,
    limit,
  ])

  return {
    data,
    loading,
  }
}
