import { useState } from 'react'
import ProductList from '../../components/products/ProductList'
import PurchaseModal from '../../components/purchases/PurchaseModal'
import { useContractQuery } from '../../hooks/useContractQuery'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { listAllProducts } from '../../services/products'
import { purchase } from '../../services/purchases'
import { parseContractError } from '../../utils/errors'

export default function BuyerShop() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const { data: products, loading, refetch } = useContractQuery(() => listAllProducts(), [])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [purchasing, setPurchasing] = useState(false)

  async function handlePurchase(productId, quantity) {
    setPurchasing(true)
    try {
      await purchase(publicKey, productId, quantity)
      showToast('Purchase successful!', 'success')
      setSelectedProduct(null)
      refetch()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Shop</h2>
      <ProductList products={products} loading={loading} onBuy={setSelectedProduct} />
      <PurchaseModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handlePurchase}
        loading={purchasing}
      />
    </div>
  )
}
