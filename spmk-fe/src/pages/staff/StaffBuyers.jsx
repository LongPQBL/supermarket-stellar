import { useState, useEffect } from 'react'
import BuyerTable from '../../components/buyers/BuyerTable'
import Skeleton from '../../components/ui/Skeleton'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { listBuyers, getBuyer } from '../../services/buyers'
import { parseContractError } from '../../utils/errors'

export default function StaffBuyers() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const [buyers, setBuyers] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const addresses = await listBuyers(publicKey)
        if (addresses && addresses.length > 0) {
          const details = await Promise.all(addresses.map(addr => getBuyer(addr).catch(() => null)))
          setBuyers(details.filter(Boolean))
        } else {
          setBuyers([])
        }
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
      <h2 className="mb-4 text-xl font-bold text-gray-900">Buyers</h2>
      {loading ? <Skeleton className="h-8 w-full" rows={5} /> : <BuyerTable buyers={buyers} />}
    </div>
  )
}
