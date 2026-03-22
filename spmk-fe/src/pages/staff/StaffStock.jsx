import { useState } from 'react'
import StockForm from '../../components/stock/StockForm'
import StockLogTable from '../../components/stock/StockLogTable'
import Card from '../../components/ui/Card'
import { useContractQuery } from '../../hooks/useContractQuery'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { listAllProducts } from '../../services/products'
import { importStock, exportStock, getStockLog } from '../../services/stock'
import { parseContractError } from '../../utils/errors'

export default function StaffStock() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const { data: products, refetch } = useContractQuery(() => listAllProducts(), [])

  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [logs, setLogs] = useState(null)
  const [logLoading, setLogLoading] = useState(false)
  const [selectedLogProduct, setSelectedLogProduct] = useState('')

  async function handleImport({ productId, quantity, supplier }) {
    setImportLoading(true)
    try {
      const newStock = await importStock(publicKey, productId, quantity, supplier)
      showToast(`Stock imported. New level: ${newStock}`, 'success')
      refetch()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setImportLoading(false)
    }
  }

  async function handleExport({ productId, quantity }) {
    setExportLoading(true)
    try {
      const newStock = await exportStock(publicKey, productId, quantity)
      showToast(`Stock exported. New level: ${newStock}`, 'success')
      refetch()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setExportLoading(false)
    }
  }

  async function handleViewLog(productId) {
    setSelectedLogProduct(productId)
    setLogLoading(true)
    try {
      const result = await getStockLog(publicKey, productId)
      setLogs(result || [])
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setLogLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Stock Management</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold text-green-700">Import Stock</h3>
          <StockForm products={products} type="import" onSubmit={handleImport} loading={importLoading} />
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold text-orange-700">Export Stock</h3>
          <StockForm products={products} type="export" onSubmit={handleExport} loading={exportLoading} />
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Stock Log</h3>
        <div className="mb-4">
          <select
            value={selectedLogProduct}
            onChange={e => e.target.value && handleViewLog(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select product to view log</option>
            {(products || []).map(p => (
              <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
            ))}
          </select>
        </div>
        {logLoading ? <p className="text-sm text-gray-500">Loading...</p> : <StockLogTable logs={logs} />}
      </Card>
    </div>
  )
}
