import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { xlmToStroops } from '../../utils/format'

export default function ProductForm({ product, onSubmit, loading }) {
  const [form, setForm] = useState({
    code: product?.code || '',
    name: product?.name || '',
    category: product?.category || '',
    origin: product?.origin || '',
    unit: product?.unit || '',
    costPrice: product ? Number(BigInt(product.cost_price)) / 1e7 : '',
    price: product ? Number(BigInt(product.price)) / 1e7 : '',
  })

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      ...form,
      costPrice: xlmToStroops(form.costPrice),
      price: xlmToStroops(form.price),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Product Code" value={form.code} onChange={set('code')} required />
        <Input label="Name" value={form.name} onChange={set('name')} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Category" value={form.category} onChange={set('category')} required />
        <Input label="Origin" value={form.origin} onChange={set('origin')} required />
      </div>
      <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="kg, liter, pack..." required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Cost Price (XLM)" type="number" step="any" min="0" value={form.costPrice} onChange={set('costPrice')} required />
        <Input label="Sell Price (XLM)" type="number" step="any" min="0" value={form.price} onChange={set('price')} required />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {product ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  )
}
