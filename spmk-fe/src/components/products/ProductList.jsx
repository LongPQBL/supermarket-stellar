import { useState } from 'react'
import ProductCard from './ProductCard'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'

export default function ProductList({ products, loading, onBuy }) {
  const [search, setSearch] = useState('')

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  const filtered = (products || [])
    .filter(p => p.is_active)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {filtered.length === 0 ? (
        <EmptyState title="No products found" message="Try a different search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onBuy={onBuy} />
          ))}
        </div>
      )}
    </div>
  )
}
