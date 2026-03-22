import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ConnectButton from '../components/wallet/ConnectButton'
import { useWallet } from '../hooks/useWallet'

export default function Landing() {
  const { publicKey, role } = useWallet()
  const navigate = useNavigate()

  useEffect(() => {
    if (!publicKey) return
    if (role === 'Admin') navigate('/admin')
    else if (role === 'Staff') navigate('/staff')
    else if (role === 'Buyer') navigate('/shop')
    else if (publicKey && !role) navigate('/register')
  }, [publicKey, role, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900">
          Supermarket <span className="text-indigo-600">on Stellar</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          A decentralized supermarket inventory management system powered by Soroban smart contracts on the Stellar blockchain.
        </p>
        <div className="mb-12">
          <ConnectButton />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-3 text-3xl">🛍</div>
            <h3 className="mb-1 font-semibold">Shop</h3>
            <p className="text-sm text-gray-500">Browse products and purchase with XLM tokens</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-3 text-3xl">📦</div>
            <h3 className="mb-1 font-semibold">Manage Stock</h3>
            <p className="text-sm text-gray-500">Import and export stock with full audit trail</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-3 text-3xl">🔐</div>
            <h3 className="mb-1 font-semibold">Role-Based Access</h3>
            <p className="text-sm text-gray-500">Admin, Staff, and Buyer roles on-chain</p>
          </div>
        </div>
        <p className="mt-12 text-sm text-gray-400">
          Supports Freighter, xBull, Lobstr and more wallets
        </p>
      </div>
    </div>
  )
}
