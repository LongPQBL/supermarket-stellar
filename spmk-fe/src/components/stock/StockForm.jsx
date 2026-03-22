import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function StockForm({ products, type = 'import', onSubmit, loading }) {
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [supplier, setSupplier] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      productId: Number(productId),
      quantity: Number(quantity),
      supplier: supplier.trim(),
    })
    setQuantity('')
    setSupplier('')
  }

  const activeProducts = (products || []).filter(p => p.is_active)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Product</label>
        <select
          value={productId}
          onChange={e => setProductId(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select a product</option>
          {activeProducts.map(p => (
            <option key={p.id} value={p.id}>[{p.code}] {p.name} (Stock: {Number(p.stock)})</option>
          ))}
        </select>
      </div>
      <Input label="Quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
      {type === 'import' && (
        <Input label="Supplier" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name" required />
      )}
      <Button type="submit" loading={loading} className="w-full">
        {type === 'import' ? 'Import Stock' : 'Export Stock'}
      </Button>
    </form>
  )
}
