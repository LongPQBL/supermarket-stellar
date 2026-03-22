import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { useContractQuery } from '../../hooks/useContractQuery'
import { useWallet } from '../../hooks/useWallet'
import { listAllProducts } from '../../services/products'
import { listBuyers } from '../../services/buyers'
import { getStockLog } from '../../services/stock'
import { stroopsToXlm, formatAddress, formatTimestamp } from '../../utils/format'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { publicKey } = useWallet()
  const { data: products, loading } = useContractQuery(() => listAllProducts(), [])
  const [buyerCount, setBuyerCount] = useState(null)
  const [recentChanges, setRecentChanges] = useState([])
  const [changesLoading, setChangesLoading] = useState(true)

  const activeProducts = (products || []).filter(p => p.is_active)
  const totalStock = activeProducts.reduce((sum, p) => sum + Number(p.stock), 0)
  const totalStockValue = activeProducts.reduce(
    (sum, p) => sum + BigInt(p.price) * BigInt(p.stock), 0n
  )
  const lowStockProducts = activeProducts.filter(p => Number(p.stock) < 10)

  // Fetch buyer count
  useEffect(() => {
    if (!publicKey) return
    listBuyers(publicKey)
      .then(addrs => setBuyerCount(addrs ? addrs.length : 0))
      .catch(() => setBuyerCount(0))
  }, [publicKey])

  // Fetch recent stock changes across all products
  useEffect(() => {
    if (!products || !publicKey) return
    async function fetchChanges() {
      setChangesLoading(true)
      const allChanges = []
      for (const p of activeProducts.slice(0, 20)) {
        try {
          const logs = await getStockLog(publicKey, Number(p.id))
          if (logs && logs.length > 0) {
            logs.forEach(log => allChanges.push({ ...log, productName: p.name, productCode: p.code }))
          }
        } catch {}
      }
      allChanges.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      setRecentChanges(allChanges.slice(0, 5))
      setChangesLoading(false)
    }
    fetchChanges()
  }, [products, publicKey])

  if (loading) return <Skeleton className="h-24 w-full" rows={4} />

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Stock</p>
          <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Stock Value</p>
          <p className="text-2xl font-bold text-gray-900">{stroopsToXlm(totalStockValue)} XLM</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Buyers</p>
          <p className="text-2xl font-bold text-gray-900">{buyerCount !== null ? buyerCount : '...'}</p>
        </Card>
        <Card className={lowStockProducts.length > 0 ? '!border-orange-300 !bg-orange-50' : ''}>
          <p className="text-sm text-gray-500">Low Stock Alert</p>
          <p className={`text-2xl font-bold ${lowStockProducts.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {lowStockProducts.length}
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/admin/products')}>➕ Add Product</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/stock')}>📥 Import Stock</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/stock')}>📤 Export Stock</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/buyers')}>👥 View Buyers</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/staff')}>👨‍💼 Manage Staff</Button>
      </div>

      {/* Low Stock Warning */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-orange-300 bg-orange-50 p-4">
          <h3 className="mb-3 font-semibold text-orange-800">⚠️ Low Stock Alert</h3>
          <Table headers={['Code', 'Name', 'Stock', 'Unit']}>
            {lowStockProducts.map(p => (
              <tr key={p.id} className="bg-orange-50">
                <td className="px-4 py-2 text-sm font-mono text-orange-900">{p.code}</td>
                <td className="px-4 py-2 text-sm font-medium text-orange-900">{p.name}</td>
                <td className="px-4 py-2 text-sm font-bold text-orange-700">{Number(p.stock)}</td>
                <td className="px-4 py-2 text-sm text-orange-900">{p.unit}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Recent Stock Changes */}
      <Card>
        <h3 className="mb-3 font-semibold text-gray-900">📋 Recent Stock Changes</h3>
        {changesLoading ? (
          <Skeleton className="h-6 w-full" rows={3} />
        ) : recentChanges.length === 0 ? (
          <p className="text-sm text-gray-500">No stock changes yet.</p>
        ) : (
          <Table headers={['Time', 'Product', 'Type', 'Qty', 'Supplier', 'Changed By']}>
            {recentChanges.map((c, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-sm text-gray-600">{formatTimestamp(c.timestamp)}</td>
                <td className="px-4 py-2 text-sm font-medium">{c.productName}</td>
                <td className="px-4 py-2">
                  <Badge variant={c.is_import ? 'import' : 'export'}>
                    {c.is_import ? 'Import' : 'Export'}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-sm font-medium">{Number(c.quantity)}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{c.is_import && c.supplier ? c.supplier : '-'}</td>
                <td className="px-4 py-2 text-sm font-mono text-gray-500">{formatAddress(c.changed_by)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
