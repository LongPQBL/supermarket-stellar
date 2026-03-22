import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { stroopsToXlm } from '../../utils/format'

export default function ProductCard({ product, onBuy }) {
  const inStock = product.stock > 0

  return (
    <Card className="flex flex-col">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.category} &middot; {product.origin}</p>
        </div>
        <Badge variant={inStock ? 'active' : 'inactive'}>
          {inStock ? `${product.stock} ${product.unit}` : 'Out of stock'}
        </Badge>
      </div>
      <p className="mb-1 text-xs text-gray-400">Code: {product.code}</p>
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-lg font-bold text-indigo-600">{stroopsToXlm(product.price)} XLM</span>
        {onBuy && (
          <Button onClick={() => onBuy(product)} disabled={!inStock} className="text-xs">
            Buy
          </Button>
        )}
      </div>
    </Card>
  )
}
