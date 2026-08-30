const STORAGE_KEY = 'shiftmate_er_user'

let currentUser = null
const listeners = new Set()

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

currentUser = loadUser()

function notify() {
  for (const listener of listeners) {
    listener(currentUser)
  }
}

export const auth = {
  isAuthenticated() {
    return currentUser !== null
  },

  getCurrentUser() {
    return currentUser
  },

  onAuthChange(callback) {
    listeners.add(callback)
    callback(currentUser)

    return () => {
      listeners.delete(callback)
    }
  },

  async signIn() {
    const existing = loadUser()

    if (existing) {
      currentUser = existing
      notify()
      return currentUser
    }

    const user = {
      id: crypto.randomUUID(),
      email: 'doctor@shiftmate.local',
      displayName: 'ER Doctor',
      avatarUrl: '',
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    currentUser = user
    notify()

    return user
  },

  signOut() {
    localStorage.removeItem(STORAGE_KEY)
    currentUser = null
    notify()
  },
}
