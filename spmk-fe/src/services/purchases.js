import { simulateReadCall, submitWriteCall, toAddress, toU64 } from './contract'

export async function purchase(buyerKey, productId, quantity) {
  return submitWriteCall(buyerKey, 'purchase',
    toAddress(buyerKey),
    toU64(productId),
    toU64(quantity)
  )
}

export async function getPurchaseHistory(callerKey, buyerAddress) {
  return simulateReadCall('get_purchase_history', toAddress(callerKey), toAddress(buyerAddress))
}
