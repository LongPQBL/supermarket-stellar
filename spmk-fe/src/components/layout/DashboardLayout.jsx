import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout({ links }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 overflow-auto p-4 pb-20 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav links={links} />
    </div>
  )
}
