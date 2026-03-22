import { useState } from 'react'
import ProductTable from '../../components/products/ProductTable'
import ProductForm from '../../components/products/ProductForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useContractQuery } from '../../hooks/useContractQuery'
import { useWallet } from '../../hooks/useWallet'
import { useToast } from '../../context/ToastContext'
import { listAllProducts, addProduct, updateProduct, removeProduct } from '../../services/products'
import { parseContractError } from '../../utils/errors'

export default function AdminProducts() {
  const { publicKey } = useWallet()
  const { showToast } = useToast()
  const { data: products, loading, refetch } = useContractQuery(() => listAllProducts(), [])

  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(false)

  async function handleAdd(data) {
    setFormLoading(true)
    try {
      await addProduct(publicKey, data)
      showToast('Product added', 'success')
      setShowForm(false)
      refetch()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleUpdate(data) {
    setFormLoading(true)
    try {
      await updateProduct(publicKey, editProduct.id, data)
      showToast('Product updated', 'success')
      setEditProduct(null)
      refetch()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleRemove() {
    setRemoveLoading(true)
    try {
      await removeProduct(publicKey, removeTarget.id)
      showToast('Product removed', 'success')
      setRemoveTarget(null)
      refetch()
    } catch (err) {
      showToast(parseContractError(err), 'error')
    } finally {
      setRemoveLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Products</h2>
        <Button onClick={() => setShowForm(true)}>Add Product</Button>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onEdit={setEditProduct}
        onRemove={setRemoveTarget}
      />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Product">
        <ProductForm onSubmit={handleAdd} loading={formLoading} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && <ProductForm product={editProduct} onSubmit={handleUpdate} loading={formLoading} />}
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Product"
        message={`Are you sure you want to deactivate "${removeTarget?.name}"?`}
        confirmText="Remove"
        variant="danger"
        loading={removeLoading}
      />
    </div>
  )
}
