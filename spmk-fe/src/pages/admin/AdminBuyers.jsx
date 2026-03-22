import { useState, useEffect } from 'react'
import BuyerTable from '../../components/buyers/BuyerTable'
import PurchaseHistory from '../../components/purchases/PurchaseHistory'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { listBuyers, getBuyer } from '../../services/buyers'
import { getPurchaseHistory } from '../../services/purchases'
import { parseContractError } from '../../utils/errors'

export default function AdminBuyers() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const [buyers, setBuyers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

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

  async function handleViewBuyer(buyer) {
    setSelectedBuyer(buyer)
    setHistoryLoading(true)
    try {
      const records = await getPurchaseHistory(publicKey, buyer.address)
      setHistory(records || [])
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Buyers</h2>
      {loading ? (
        <Skeleton className="h-8 w-full" rows={5} />
      ) : (
        <BuyerTable buyers={buyers} onView={handleViewBuyer} />
      )}

      <Modal
        open={!!selectedBuyer}
        onClose={() => { setSelectedBuyer(null); setHistory(null) }}
        title={`Purchase History — ${selectedBuyer?.name}`}
      >
        {historyLoading ? <Skeleton className="h-6 w-full" rows={3} /> : <PurchaseHistory records={history} />}
      </Modal>
    </div>
  )
}
