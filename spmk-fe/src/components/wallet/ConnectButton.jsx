import { useWallet } from '../../hooks/useWallet'
import Button from '../ui/Button'
import { formatAddress } from '../../utils/format'

export default function ConnectButton() {
  const { publicKey, connect, disconnect, isConnecting } = useWallet()

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm text-gray-600">{formatAddress(publicKey)}</span>
        <Button variant="secondary" onClick={disconnect}>Disconnect</Button>
      </div>
    )
  }

  return (
    <Button onClick={connect} loading={isConnecting}>
      Connect Wallet
    </Button>
  )
}
