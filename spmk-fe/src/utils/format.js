export function stroopsToXlm(stroops) {
  if (stroops === null || stroops === undefined) return '0'
  const value = Number(BigInt(stroops)) / 10_000_000
  return value.toFixed(7).replace(/\.?0+$/, '')
}

export function xlmToStroops(xlm) {
  return BigInt(Math.round(Number(xlm) * 10_000_000))
}

export function formatAddress(address) {
  if (!address) return ''
  if (address.length <= 8) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleString()
}
