import { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-3 bg-vinyl-black border border-gray-700 rounded-lg',
        'text-white placeholder-gray-500 focus:outline-none focus:ring-2',
        'focus:ring-primary-500 focus:border-transparent',
        'resize-none',
        className
      )}
      {...props}
    />
  )
}
