import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Card from '../components/ui/Card'
import RegisterForm from '../components/buyers/RegisterForm'
import { useWallet } from '../hooks/useWallet'

export default function Register() {
  const { publicKey, role } = useWallet()
  const navigate = useNavigate()

  useEffect(() => {
    if (!publicKey) navigate('/')
    if (role === 'Admin') navigate('/admin')
    if (role === 'Staff') navigate('/staff')
    if (role === 'Buyer') navigate('/shop')
  }, [publicKey, role, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Register as Buyer</h2>
          <p className="mt-1 text-sm text-gray-500">Create your account to start shopping</p>
        </div>
        <Card>
          <RegisterForm onSuccess={() => navigate('/shop')} />
        </Card>
      </div>
    </div>
  )
}
