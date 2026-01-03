interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function LoadingSpinner({ size = 'md', showText = true }: LoadingSpinnerProps = {}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-4',
  }

  if (size === 'sm') {
    return (
      <div className="relative w-4 h-4">
        <div className={`absolute inset-0 ${sizeClasses.sm} border-primary-500/30 rounded-full`}></div>
        <div className={`absolute inset-0 ${sizeClasses.sm} border-transparent border-t-primary-500 rounded-full animate-spin`}></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      {showText && <p className="text-gray-400">Загрузка...</p>}
    </div>
  )
}
