import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  href?: string
  className?: string
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center'

  const variantClasses = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800 shadow-lg hover:shadow-xl',
    secondary: 'bg-success-500 text-white hover:bg-success-600 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-primary-700 text-primary-700 hover:bg-primary-50',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}

export default Button
