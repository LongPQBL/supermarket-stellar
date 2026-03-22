import { useState, useMemo } from 'react'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useContractQuery } from '../../hooks/useContractQuery'
import { listAllProducts } from '../../services/products'
import { stroopsToXlm } from '../../utils/format'

export default function StaffProducts() {
  const { data: products, loading } = useContractQuery(() => listAllProducts(), [])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = useMemo(() => {
    if (!products) return []
    return [...new Set(products.filter(p => p.is_active).map(p => p.category))].sort()
  }, [products])

  const filtered = useMemo(() => {
    if (!products) return []
    return products
      .filter(p => p.is_active)
      .filter(p => !categoryFilter || p.category === categoryFilter)
      .filter(p => {
        if (!search) return true
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      })
  }, [products, search, categoryFilter])

  if (loading) return <Skeleton className="h-8 w-full" rows={6} />

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Products</h2>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No products found" message="Try a different search or filter." />
      ) : (
        <Table headers={['Code', 'Name', 'Category', 'Price (XLM)', 'Stock', 'Status']}>
          {filtered.map(p => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-sm font-mono">{p.code}</td>
              <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
              <td className="px-4 py-3 text-sm">{p.category}</td>
              <td className="px-4 py-3 text-sm">{stroopsToXlm(p.price)}</td>
              <td className="px-4 py-3 text-sm">{Number(p.stock)} {p.unit}</td>
              <td className="px-4 py-3">
                <Badge variant={Number(p.stock) > 0 ? 'active' : 'inactive'}>
                  {Number(p.stock) > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  )
}
