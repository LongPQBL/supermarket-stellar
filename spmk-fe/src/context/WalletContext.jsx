import { createContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit'
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter'
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull'
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana'
import { getRole } from '../services/admin'
import { NETWORK } from '../config/stellar'

export const WalletContext = createContext()

const network = NETWORK === 'testnet' ? Networks.TESTNET : Networks.PUBLIC

export function WalletProvider({ children }) {
  const [publicKey, setPublicKey] = useState(null)
  const [role, setRole] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      StellarWalletsKit.init({
        network,
        selectedWalletId: 'freighter',
        modules: [
          new FreighterModule(),
          new xBullModule(),
          new HanaModule(),
        ],
      })
      initialized.current = true
    }
  }, [])

  const fetchRole = useCallback(async (key) => {
    try {
      const r = await getRole(key)
      console.log('get_role raw result:', JSON.stringify(r), typeof r)

      if (r === null || r === undefined) {
        setRole(null)
      } else if (typeof r === 'string') {
        // Direct string: "Admin", "Staff", "Buyer"
        setRole(r)
      } else if (Array.isArray(r) && r.length > 0) {
        // Array format: ["Admin"] or [{"Admin": null}]
        const first = r[0]
        setRole(typeof first === 'string' ? first : Object.keys(first)[0])
      } else if (typeof r === 'object') {
        // Object format: { "Admin": null } or { "Admin": [] }
        const keys = Object.keys(r)
        if (keys.length > 0) {
          setRole(keys[0])
        } else {
          setRole(null)
        }
      } else {
        setRole(null)
      }
    } catch (err) {
      console.error('get_role error:', err)
      setRole(null)
    }
  }, [])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const { address } = await StellarWalletsKit.authModal()
      setPublicKey(address)
      await fetchRole(address)
    } catch (err) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [fetchRole])

  const disconnect = useCallback(async () => {
    try {
      await StellarWalletsKit.disconnect()
    } catch {}
    setPublicKey(null)
    setRole(null)
    setError(null)
  }, [])

  const refreshRole = useCallback(async () => {
    if (publicKey) {
      await fetchRole(publicKey)
    }
  }, [publicKey, fetchRole])

  const value = useMemo(() => ({
    publicKey, role, isConnecting, error,
    connect, disconnect, refreshRole,
  }), [publicKey, role, isConnecting, error, connect, disconnect, refreshRole])

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
