import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { transferAdmin, setToken, extendTtl } from '../../services/admin'
import { parseContractError } from '../../utils/errors'

export default function AdminSettings() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()

  const [newAdmin, setNewAdmin] = useState('')
  const [newToken, setNewToken] = useState('')
  const [loading, setLoading] = useState({})

  async function handleTransferAdmin(e) {
    e.preventDefault()
    setLoading(l => ({ ...l, admin: true }))
    try {
      await transferAdmin(publicKey, newAdmin.trim())
      showToast('Admin transferred', 'success')
      setNewAdmin('')
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setLoading(l => ({ ...l, admin: false }))
    }
  }

  async function handleSetToken(e) {
    e.preventDefault()
    setLoading(l => ({ ...l, token: true }))
    try {
      await setToken(publicKey, newToken.trim())
      showToast('Token address updated', 'success')
      setNewToken('')
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setLoading(l => ({ ...l, token: false }))
    }
  }

  async function handleExtendTtl() {
    setLoading(l => ({ ...l, ttl: true }))
    try {
      await extendTtl(publicKey)
      showToast('TTL extended', 'success')
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setLoading(l => ({ ...l, ttl: false }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 font-semibold">Transfer Admin</h3>
        <form onSubmit={handleTransferAdmin} className="flex gap-3">
          <Input value={newAdmin} onChange={e => setNewAdmin(e.target.value)} placeholder="New admin address (G...)" className="flex-1" />
          <Button type="submit" variant="danger" loading={loading.admin}>Transfer</Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Update Payment Token</h3>
        <form onSubmit={handleSetToken} className="flex gap-3">
          <Input value={newToken} onChange={e => setNewToken(e.target.value)} placeholder="Token contract address (C...)" className="flex-1" />
          <Button type="submit" loading={loading.token}>Update</Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Extend Contract TTL</h3>
        <p className="mb-3 text-sm text-gray-500">Extend the time-to-live for contract storage.</p>
        <Button onClick={handleExtendTtl} loading={loading.ttl}>Extend TTL</Button>
      </Card>
    </div>
  )
}
