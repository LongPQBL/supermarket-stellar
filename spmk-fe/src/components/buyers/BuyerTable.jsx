import Table from '../ui/Table'
import EmptyState from '../ui/EmptyState'
import { formatAddress, formatTimestamp, stroopsToXlm } from '../../utils/format'

export default function BuyerTable({ buyers, onView }) {
  if (!buyers || buyers.length === 0) {
    return <EmptyState title="No buyers" message="No buyers registered yet." />
  }

  return (
    <Table headers={['Address', 'Name', 'Phone', 'Purchases', 'Total Spent', 'Registered', onView ? 'Actions' : ''].filter(Boolean)}>
      {buyers.map(b => (
        <tr key={b.address}>
          <td className="px-4 py-3 text-sm font-mono">{formatAddress(b.address)}</td>
          <td className="px-4 py-3 text-sm font-medium">{b.name}</td>
          <td className="px-4 py-3 text-sm">{b.phone}</td>
          <td className="px-4 py-3 text-sm">{Number(b.purchase_count)}</td>
          <td className="px-4 py-3 text-sm">{stroopsToXlm(b.total_spent)} XLM</td>
          <td className="px-4 py-3 text-sm">{formatTimestamp(b.registered_at)}</td>
          {onView && (
            <td className="px-4 py-3">
              <button onClick={() => onView(b)} className="text-sm text-indigo-600 hover:underline">View</button>
            </td>
          )}
        </tr>
      ))}
    </Table>
  )
}
