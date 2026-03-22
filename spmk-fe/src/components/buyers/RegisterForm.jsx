import { useState } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { registerBuyer } from '../../services/buyers'
import { parseContractError } from '../../utils/errors'
import { formatAddress } from '../../utils/format'

export default function RegisterForm({ onSuccess }) {
  const { publicKey, refreshRole } = useWallet()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    try {
      await registerBuyer(publicKey, name.trim(), phone.trim())
      showToast('Registration successful!', 'success')
      await refreshRole()
      onSuccess?.()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        Wallet: <span className="font-mono font-medium">{formatAddress(publicKey)}</span>
      </div>
      <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
      <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your phone" required />
      <Button type="submit" loading={loading} className="w-full">Register as Buyer</Button>
    </form>
  )
}
