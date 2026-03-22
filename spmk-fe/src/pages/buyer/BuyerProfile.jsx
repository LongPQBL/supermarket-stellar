import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import { useContractQuery } from '../../hooks/useContractQuery'
import { useWallet } from '../../hooks/useWallet'
import { getBuyer } from '../../services/buyers'
import { formatAddress, stroopsToXlm, formatTimestamp } from '../../utils/format'

export default function BuyerProfile() {
  const { publicKey } = useWallet()
  const { data: buyer, loading } = useContractQuery(() => getBuyer(publicKey), [publicKey])

  if (loading) return <Skeleton className="h-6 w-full" rows={6} />

  if (!buyer) return <p className="text-gray-500">Could not load profile.</p>

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">My Profile</h2>
      <Card>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-gray-500">Wallet Address</dt>
            <dd className="font-mono text-sm">{publicKey}</dd>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="font-medium">{buyer.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="font-medium">{buyer.phone}</dd>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-gray-500">Total Spent</dt>
              <dd className="text-lg font-bold text-indigo-600">{stroopsToXlm(buyer.total_spent)} XLM</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Purchases</dt>
              <dd className="text-lg font-bold">{Number(buyer.purchase_count)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Points</dt>
              <dd className="text-lg font-bold">{Number(buyer.points)}</dd>
            </div>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Registered</dt>
            <dd className="text-sm">{formatTimestamp(buyer.registered_at)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
