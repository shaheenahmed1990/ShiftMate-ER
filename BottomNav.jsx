import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Clock3,
  ClipboardList,
  MoreHorizontal,
  Bell,
  Handshake,
  FileText,
  History,
  Settings,
} from 'lucide-react'
import { useApp } from '../hooks/useApp'

const mainItems = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/shift', label: 'Shift', icon: Clock3 },
  { path: '/cases', label: 'Cases', icon: ClipboardList },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
]

const moreItems = [
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/handover', label: 'Handover', icon: Handshake },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ item, ui, lang, dark, onClick }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition md:justify-start ${
          isActive
            ? dark
              ? 'bg-white/10 text-white font-medium'
              : 'bg-slate-200 text-slate-900 font-medium'
            : `${ui.sub} hover:bg-white/5`
        }`
      }
    >
      <Icon size={18} />
      <span>{lang === 'ar' ? item.label : item.label}</span>
    </NavLink>
  )
}

export default function BottomNav() {
  const { ui, lang, dark } = useApp()
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const isMoreActive = moreItems.some(
    (item) => location.pathname === item.path,
  )

  return (
    <>
      <nav
        className={`relative z-20 w-full shrink-0 border-r ${ui.divider} ${ui.navBg} md:w-56`}
      >
        <div className="flex gap-2 p-3 md:flex-col">
          {mainItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              ui={ui}
              lang={lang}
              dark={dark}
            />
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition md:flex-none md:justify-start ${
              isMoreActive || moreOpen
                ? dark
                  ? 'bg-white/10 text-white font-medium'
                  : 'bg-slate-200 text-slate-900 font-medium'
                : `${ui.sub} hover:bg-white/5`
            }`}
          >
            <MoreHorizontal size={18} />
            <span>{lang === 'ar' ? 'المزيد' : 'More'}</span>
          </button>
        </div>

        {moreOpen && (
          <div
            className={`relative z-30 mx-3 mb-3 space-y-1 rounded-xl p-2 ${ui.card}`}
          >
            {moreItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                ui={ui}
                lang={lang}
                dark={dark}
                onClick={() => setMoreOpen(false)}
              />
            ))}
          </div>
        )}
      </nav>

      {moreOpen && (
        <button
          type="button"
          aria-label={lang === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-10 cursor-default"
        >
          <span className="sr-only">
            {lang === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          </span>
        </button>
      )}
    </>
  )
}
