import { simulateReadCall, submitWriteCall, toAddress, toScString, toI128, toU64 } from './contract'

export async function listProducts() {
  return simulateReadCall('list_products')
}

export async function getProduct(productId) {
  return simulateReadCall('get_product', toU64(productId))
}

export async function listAllProducts() {
  const ids = await listProducts()
  if (!ids || ids.length === 0) return []
  const products = await Promise.all(ids.map(id => getProduct(Number(id))))
  return products.filter(Boolean)
}

export async function addProduct(adminKey, { code, name, category, origin, unit, costPrice, price }) {
  return submitWriteCall(adminKey, 'add_product',
    toAddress(adminKey),
    toScString(code),
    toScString(name),
    toScString(category),
    toScString(origin),
    toScString(unit),
    toI128(costPrice),
    toI128(price)
  )
}

export async function updateProduct(adminKey, productId, { code, name, category, origin, unit, costPrice, price }) {
  return submitWriteCall(adminKey, 'update_product',
    toAddress(adminKey),
    toU64(productId),
    toScString(code),
    toScString(name),
    toScString(category),
    toScString(origin),
    toScString(unit),
    toI128(costPrice),
    toI128(price)
  )
}

export async function removeProduct(adminKey, productId) {
  return submitWriteCall(adminKey, 'remove_product',
    toAddress(adminKey),
    toU64(productId)
  )
}
