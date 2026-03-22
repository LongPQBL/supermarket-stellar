import Table from '../ui/Table'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import { stroopsToXlm } from '../../utils/format'

export default function ProductTable({ products, loading, onEdit, onRemove }) {
  if (loading) return <Skeleton className="h-8 w-full" rows={5} />

  if (!products || products.length === 0) {
    return <EmptyState title="No products" message="Add your first product to get started." />
  }

  return (
    <Table headers={['ID', 'Code', 'Name', 'Category', 'Price (XLM)', 'Stock', 'Status', 'Actions']}>
      {products.map(p => (
        <tr key={p.id}>
          <td className="px-4 py-3 text-sm">{Number(p.id)}</td>
          <td className="px-4 py-3 text-sm font-mono">{p.code}</td>
          <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
          <td className="px-4 py-3 text-sm">{p.category}</td>
          <td className="px-4 py-3 text-sm">{stroopsToXlm(p.price)}</td>
          <td className="px-4 py-3 text-sm">{Number(p.stock)} {p.unit}</td>
          <td className="px-4 py-3">
            <Badge variant={p.is_active ? 'active' : 'inactive'}>
              {p.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2">
              {onEdit && <Button variant="ghost" onClick={() => onEdit(p)} className="text-xs">Edit</Button>}
              {onRemove && p.is_active && (
                <Button variant="ghost" onClick={() => onRemove(p)} className="text-xs text-red-600">Remove</Button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </Table>
  )
}
