import { useState, useEffect } from 'react'
import PurchaseHistory from '../../components/purchases/PurchaseHistory'
import Skeleton from '../../components/ui/Skeleton'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { getPurchaseHistory } from '../../services/purchases'
import { parseContractError } from '../../utils/errors'

export default function BuyerHistory() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const [records, setRecords] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const result = await getPurchaseHistory(publicKey, publicKey)
        setRecords(result || [])
      } catch (err) {
        showToast(parseContractError(err), 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [publicKey])

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Purchase History</h2>
      {loading ? <Skeleton className="h-8 w-full" rows={5} /> : <PurchaseHistory records={records} />}
    </div>
  )
}
