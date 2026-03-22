export default function Skeleton({ className = '', rows = 1 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`rounded bg-gray-200 ${className || 'h-4 w-full'}`} />
      ))}
    </div>
  )
}
