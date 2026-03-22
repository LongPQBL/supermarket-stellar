import { simulateReadCall, submitWriteCall, toAddress, toScString } from './contract'

export async function registerBuyer(buyerKey, name, phone) {
  return submitWriteCall(buyerKey, 'register_buyer',
    toAddress(buyerKey),
    toScString(name),
    toScString(phone)
  )
}

export async function getBuyer(buyerAddress) {
  return simulateReadCall('get_buyer', toAddress(buyerAddress))
}

export async function listBuyers(callerKey) {
  return simulateReadCall('list_buyers', toAddress(callerKey))
}
