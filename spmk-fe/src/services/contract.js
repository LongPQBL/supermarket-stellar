import * as StellarSdk from '@stellar/stellar-sdk'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from '../config/stellar'

const { Contract, TransactionBuilder, Address, nativeToScVal, scValToNative, rpc } = StellarSdk

export function getServer() {
  return new rpc.Server(RPC_URL)
}

export function getContract() {
  return new Contract(CONTRACT_ID)
}

export function toAddress(publicKey) {
  return new Address(publicKey).toScVal()
}

export function toScString(str) {
  return nativeToScVal(str, { type: 'string' })
}

export function toI128(value) {
  return nativeToScVal(BigInt(value), { type: 'i128' })
}

export function toU64(value) {
  return nativeToScVal(value, { type: 'u64' })
}

export function toEnum(variant) {
  return StellarSdk.xdr.ScVal.scvVec([StellarSdk.xdr.ScVal.scvSymbol(variant)])
}

export async function simulateReadCall(method, ...args) {
  const server = getServer()
  const contract = getContract()
  const account = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF')
    .catch(() => new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'))

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const sim = await server.simulateTransaction(tx)

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error || 'Simulation failed')
  }

  if (sim.result?.retval) {
    return scValToNative(sim.result.retval)
  }

  return null
}

export async function submitWriteCall(publicKey, method, ...args) {
  const server = getServer()
  const contract = getContract()
  const account = await server.getAccount(publicKey)

  const tx = new TransactionBuilder(account, {
    fee: '10000000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build()

  const prepared = await server.prepareTransaction(tx)
  const txXdr = prepared.toXDR()

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(txXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  const signed = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE)
  const response = await server.sendTransaction(signed)

  if (response.status === 'ERROR') {
    throw new Error('Transaction submission failed')
  }

  return await pollTransaction(server, response.hash)
}

async function pollTransaction(server, hash) {
  for (let i = 0; i < 30; i++) {
    const result = await server.getTransaction(hash)

    if (result.status === 'SUCCESS') {
      if (result.returnValue) {
        return scValToNative(result.returnValue)
      }
      return null
    }

    if (result.status === 'FAILED') {
      throw new Error('Transaction failed on-chain')
    }

    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Transaction timed out')
}
