import Table from '../ui/Table'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { formatAddress, formatTimestamp } from '../../utils/format'

export default function StockLogTable({ logs }) {
  if (!logs || logs.length === 0) {
    return <EmptyState title="No stock changes" message="Stock history will appear here." />
  }

  return (
    <Table headers={['Type', 'Quantity', 'Supplier', 'Changed By', 'Time']}>
      {logs.map((log, i) => (
        <tr key={i}>
          <td className="px-4 py-3">
            <Badge variant={log.is_import ? 'import' : 'export'}>
              {log.is_import ? 'Import' : 'Export'}
            </Badge>
          </td>
          <td className="px-4 py-3 text-sm">{Number(log.quantity)}</td>
          <td className="px-4 py-3 text-sm">{log.supplier || '-'}</td>
          <td className="px-4 py-3 text-sm font-mono">{formatAddress(log.changed_by)}</td>
          <td className="px-4 py-3 text-sm">{formatTimestamp(log.timestamp)}</td>
        </tr>
      ))}
    </Table>
  )
}
