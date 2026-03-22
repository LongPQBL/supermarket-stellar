import { Routes, Route, Navigate } from 'react-router-dom'
import { useWallet } from './hooks/useWallet'
import DashboardLayout from './components/layout/DashboardLayout'

import Landing from './pages/Landing'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminStock from './pages/admin/AdminStock'
import AdminBuyers from './pages/admin/AdminBuyers'
import AdminStaff from './pages/admin/AdminStaff'

import StaffDashboard from './pages/staff/StaffDashboard'
import StaffProducts from './pages/staff/StaffProducts'
import StaffStock from './pages/staff/StaffStock'
import StaffBuyers from './pages/staff/StaffBuyers'

import BuyerShop from './pages/buyer/BuyerShop'
import BuyerHistory from './pages/buyer/BuyerHistory'
import BuyerProfile from './pages/buyer/BuyerProfile'

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/stock', label: 'Stock', icon: '🏭' },
  { to: '/admin/buyers', label: 'Buyers', icon: '👥' },
  { to: '/admin/staff', label: 'Staff & Settings', icon: '⚙️' },
]

const staffLinks = [
  { to: '/staff', label: 'Overview', icon: '📊' },
  { to: '/staff/products', label: 'Products', icon: '📦' },
  { to: '/staff/stock', label: 'Stock', icon: '🏭' },
  { to: '/staff/buyers', label: 'Buyers', icon: '👥' },
]

const buyerLinks = [
  { to: '/shop', label: 'Shop', icon: '🛍' },
  { to: '/shop/history', label: 'History', icon: '📋' },
  { to: '/shop/profile', label: 'Profile', icon: '👤' },
]

function ProtectedRoute({ role: requiredRole, children }) {
  const { publicKey, role } = useWallet()

  if (!publicKey) return <Navigate to="/" replace />
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={
        <ProtectedRoute role="Admin">
          <DashboardLayout links={adminLinks} />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="stock" element={<AdminStock />} />
        <Route path="buyers" element={<AdminBuyers />} />
        <Route path="staff" element={<AdminStaff />} />
      </Route>

      <Route path="/staff" element={
        <ProtectedRoute role="Staff">
          <DashboardLayout links={staffLinks} />
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="products" element={<StaffProducts />} />
        <Route path="stock" element={<StaffStock />} />
        <Route path="buyers" element={<StaffBuyers />} />
      </Route>

      <Route path="/shop" element={
        <ProtectedRoute role="Buyer">
          <DashboardLayout links={buyerLinks} />
        </ProtectedRoute>
      }>
        <Route index element={<BuyerShop />} />
        <Route path="history" element={<BuyerHistory />} />
        <Route path="profile" element={<BuyerProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
