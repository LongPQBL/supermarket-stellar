const colors = {
  Admin: 'bg-purple-100 text-purple-700',
  Staff: 'bg-blue-100 text-blue-700',
  Buyer: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  import: 'bg-emerald-100 text-emerald-700',
  export: 'bg-orange-100 text-orange-700',
}

export default function Badge({ children, variant = 'active' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant] || colors.active}`}>
      {children}
    </span>
  )
}
