import { simulateReadCall, submitWriteCall, toAddress, toEnum } from './contract'

export async function getRole(publicKey) {
  return simulateReadCall('get_role', toAddress(publicKey))
}

export async function setRole(adminKey, accountKey, role) {
  return submitWriteCall(adminKey, 'set_role',
    toAddress(adminKey),
    toAddress(accountKey),
    toEnum(role)
  )
}

export async function removeRole(adminKey, accountKey) {
  return submitWriteCall(adminKey, 'remove_role',
    toAddress(adminKey),
    toAddress(accountKey)
  )
}

export async function transferAdmin(currentAdminKey, newAdminKey) {
  return submitWriteCall(currentAdminKey, 'transfer_admin',
    toAddress(currentAdminKey),
    toAddress(newAdminKey)
  )
}

export async function setToken(adminKey, tokenAddress) {
  return submitWriteCall(adminKey, 'set_token',
    toAddress(adminKey),
    toAddress(tokenAddress)
  )
}

export async function extendTtl(adminKey) {
  return submitWriteCall(adminKey, 'extend_ttl',
    toAddress(adminKey)
  )
}
