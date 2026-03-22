import Table from '../ui/Table'
import EmptyState from '../ui/EmptyState'
import { stroopsToXlm, formatTimestamp } from '../../utils/format'

export default function PurchaseHistory({ records }) {
  if (!records || records.length === 0) {
    return <EmptyState title="No purchases" message="Your purchase history will appear here." />
  }

  return (
    <Table headers={['Product Code', 'Quantity', 'Total (XLM)', 'Date']}>
      {records.map((r, i) => (
        <tr key={i}>
          <td className="px-4 py-3 text-sm font-mono">{r.product_code}</td>
          <td className="px-4 py-3 text-sm">{Number(r.quantity)}</td>
          <td className="px-4 py-3 text-sm font-medium">{stroopsToXlm(r.total_price)}</td>
          <td className="px-4 py-3 text-sm">{formatTimestamp(r.timestamp)}</td>
        </tr>
      ))}
    </Table>
  )
}
