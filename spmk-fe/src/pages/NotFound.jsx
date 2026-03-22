import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold text-gray-200">404</h1>
        <p className="mb-6 text-gray-600">Page not found</p>
        <Link to="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  )
}
