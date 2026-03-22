import { simulateReadCall, submitWriteCall, toAddress, toScString, toU64 } from './contract'

export async function importStock(callerKey, productId, quantity, supplier) {
  return submitWriteCall(callerKey, 'import_stock',
    toAddress(callerKey),
    toU64(productId),
    toU64(quantity),
    toScString(supplier)
  )
}

export async function exportStock(callerKey, productId, quantity) {
  return submitWriteCall(callerKey, 'export_stock',
    toAddress(callerKey),
    toU64(productId),
    toU64(quantity)
  )
}

export async function getStockLog(callerKey, productId) {
  return simulateReadCall('get_stock_log', toAddress(callerKey), toU64(productId))
}
