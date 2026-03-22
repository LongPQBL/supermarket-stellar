import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { stroopsToXlm } from '../../utils/format'

export default function PurchaseModal({ product, open, onClose, onConfirm, loading }) {
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const totalStroops = BigInt(product.price) * BigInt(quantity)

  function handleConfirm() {
    onConfirm(product.id, quantity)
  }

  return (
    <Modal open={open} onClose={onClose} title={`Buy ${product.name}`}>
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-3 text-sm">
          <p>Price: <span className="font-semibold">{stroopsToXlm(product.price)} XLM</span> / {product.unit}</p>
          <p>In stock: <span className="font-semibold">{Number(product.stock)} {product.unit}</span></p>
        </div>
        <Input
          label="Quantity"
          type="number"
          min="1"
          max={Number(product.stock)}
          value={quantity}
          onChange={e => setQuantity(Math.max(1, Math.min(Number(e.target.value), Number(product.stock))))}
        />
        <div className="rounded-lg bg-indigo-50 p-3 text-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-indigo-600">{stroopsToXlm(totalStroops)} XLM</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
          <Button onClick={handleConfirm} loading={loading} className="flex-1">Confirm Purchase</Button>
        </div>
      </div>
    </Modal>
  )
}
