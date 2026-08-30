import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../hooks/useApp'

const items = [
  { path: '/', label: 'Dashboard' },
  { path: '/shift', label: 'Shift' },
  { path: '/cases', label: 'Cases' },
  { path: '/tasks', label: 'Tasks' },
  { path: '/settings', label: 'Settings' },
]

export default function BottomNav() {
  const { ui } = useApp()

  return (
    <nav
      className={`w-full md:w-56 shrink-0 border-r ${ui.divider} ${ui.navBg}`}
    >
      <div className="p-3 flex md:flex-col gap-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex-1 md:flex-none rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-white/10 font-medium'
                  : `${ui.sub} hover:bg-white/5`
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
