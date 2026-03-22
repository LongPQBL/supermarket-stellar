const ERROR_MESSAGES = {
  1: 'Contract not initialized',
  2: 'Contract already initialized',
  3: 'Unauthorized — insufficient permissions',
  4: 'Product not found',
  5: 'Product already exists',
  6: 'Insufficient stock',
  7: 'Invalid quantity — must be greater than zero',
  8: 'Buyer not found — please register first',
  9: 'Buyer already registered',
  10: 'Invalid price — must be greater than zero',
  11: 'Insufficient funds',
  12: 'Duplicate product code',
}

export function parseContractError(error) {
  const message = error?.message || String(error)
  const match = message.match(/Error\(Contract, #(\d+)\)/)
  if (match) {
    const code = Number(match[1])
    return ERROR_MESSAGES[code] || `Contract error #${code}`
  }
  if (message.includes('Transaction simulation failed')) {
    return 'Transaction failed — please check your inputs and try again'
  }
  if (message.includes('insufficient balance')) {
    return 'Insufficient XLM balance'
  }
  return message || 'An unexpected error occurred'
}
