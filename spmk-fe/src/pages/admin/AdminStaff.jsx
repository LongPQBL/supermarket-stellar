import { useState, useEffect, useCallback } from 'react'
import RoleManager from '../../components/admin/RoleManager'
import AdminSettingsComponent from '../../components/admin/AdminSettings'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { getRole, removeRole } from '../../services/admin'
import { parseContractError } from '../../utils/errors'
import { formatAddress } from '../../utils/format'

export default function AdminStaff() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const [staffAddresses, setStaffAddresses] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [removingAddr, setRemovingAddr] = useState(null)
  const [copiedAddr, setCopiedAddr] = useState(null)

  const fetchStaff = useCallback(async () => {
    // There's no list_staff in the contract, so we track locally
    // Staff addresses are stored in localStorage for persistence
    const stored = JSON.parse(localStorage.getItem('spmk_staff_list') || '[]')
    // Verify each address still has Staff role
    const verified = []
    for (const addr of stored) {
      try {
        const role = await getRole(addr)
        const roleName = Array.isArray(role) ? role[0] : (typeof role === 'object' && role ? Object.keys(role)[0] : role)
        if (roleName === 'Staff') {
          verified.push(addr)
        }
      } catch {
        // Skip addresses that fail
      }
    }
    setStaffAddresses(verified)
    localStorage.setItem('spmk_staff_list', JSON.stringify(verified))
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  async function handleAddSuccess(address) {
    const updated = [...new Set([...staffAddresses, address])]
    setStaffAddresses(updated)
    localStorage.setItem('spmk_staff_list', JSON.stringify(updated))
  }

  async function handleRemove(addr) {
    setRemovingAddr(addr)
    try {
      await removeRole(publicKey, addr)
      showToast('Staff removed', 'success')
      const updated = staffAddresses.filter(a => a !== addr)
      setStaffAddresses(updated)
      localStorage.setItem('spmk_staff_list', JSON.stringify(updated))
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setRemovingAddr(null)
    }
  }

  function handleCopy(addr) {
    navigator.clipboard.writeText(addr)
    setCopiedAddr(addr)
    setTimeout(() => setCopiedAddr(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Staff Management</h2>
        <RoleManager onAddSuccess={handleAddSuccess} />
      </div>

      <Card className="overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <h3 className="font-semibold text-gray-900">
            Staff List ({staffAddresses.length})
          </h3>
          <span className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            expanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            {staffAddresses.length === 0 ? (
              <EmptyState title="No staff" message="Add staff members using the form above." />
            ) : (
              <Table headers={['#', 'Wallet Address', 'Action']}>
                {staffAddresses.map((addr, i) => (
                  <tr key={addr}>
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCopy(addr)}
                        className="inline-flex items-center gap-1.5 font-mono text-sm text-gray-700 hover:text-indigo-600 transition"
                        title="Click to copy full address"
                      >
                        {formatAddress(addr)}
                        {copiedAddr === addr ? (
                          <span className="text-xs text-green-600">Copied!</span>
                        ) : (
                          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="danger"
                        className="text-xs"
                        loading={removingAddr === addr}
                        onClick={() => handleRemove(addr)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Settings</h2>
        <AdminSettingsComponent />
      </div>
    </div>
  )
}
