import { Link } from 'react-router-dom'
import ConnectButton from '../wallet/ConnectButton'
import Badge from '../ui/Badge'
import { useWallet } from '../../hooks/useWallet'

export default function Navbar() {
  const { role } = useWallet()

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <span className="text-lg font-bold text-gray-900">SuperMarket</span>
        </Link>
        <div className="flex items-center gap-3">
          {role && <Badge variant={role}>{role}</Badge>}
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
