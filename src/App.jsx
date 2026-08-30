import React, { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './hooks/useApp'
import { auth } from './lib/auth'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Shift from './pages/Shift'
import Cases from './pages/Cases'
import Tasks from './pages/Tasks'
import Reminders from './pages/Reminders'
import Handover from './pages/Handover'
import Notes from './pages/Notes'
import History from './pages/History'
import Settings from './pages/Settings'

function Shell() {
  const { ui } = useApp()
  const [authState, setAuthState] = useState(() => (auth.isAuthenticated() ? 'in' : 'checking'))

  useEffect(() => {
    const unsub = auth.onAuthChange((user) => setAuthState(user ? 'in' : 'out'))
    return unsub
  }, [])

  if (authState === 'checking') {
    return <div className={`h-full ${ui.bg}`} />
  }

  if (authState === 'out') {
    return <Login />
  }

  return (
    <div className={`h-full flex ${ui.bg}`}>
      <BottomNav />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shift" element={<Shift />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/handover" element={<Handover />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  )
}
