import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { setRole } from '../../services/admin'
import { parseContractError } from '../../utils/errors'

export default function RoleManager({ onAddSuccess }) {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAddStaff(e) {
    e.preventDefault()
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    try {
      await setRole(publicKey, addr, 'Staff')
      showToast('Staff added successfully', 'success')
      setAddress('')
      onAddSuccess?.(addr)
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleAddStaff} className="flex gap-3">
      <Input
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder="Stellar address (G...)"
        className="flex-1"
      />
      <Button type="submit" loading={loading}>Add Staff</Button>
    </form>
  )
}
