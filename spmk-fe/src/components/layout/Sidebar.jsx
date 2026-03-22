import { NavLink } from 'react-router-dom'

export default function Sidebar({ links }) {
  return (
    <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-50">
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
