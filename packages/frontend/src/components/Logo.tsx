interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  showText?: boolean
  variant?: 'default' | 'white' | 'colored'
  className?: string
}

export default function Logo({
  size = 'medium',
  showText = true,
  variant = 'default',
  className = ''
}: LogoProps) {
  const sizes = {
    small: { shield: 32, text: 'text-xl', gap: 'gap-2' },
    medium: { shield: 48, text: 'text-3xl', gap: 'gap-3' },
    large: { shield: 64, text: 'text-4xl', gap: 'gap-4' },
    xlarge: { shield: 80, text: 'text-5xl', gap: 'gap-5' }
  }

  const currentSize = sizes[size]
  const shieldSize = currentSize.shield

  // Colors based on variant
  const colors = {
    default: {
      shieldGradient: 'url(#shield-gradient)',
      cart: 'white',
      text: '#667eea'
    },
    white: {
      shieldGradient: 'white',
      cart: '#667eea',
      text: 'white'
    },
    colored: {
      shieldGradient: 'url(#shield-gradient)',
      cart: 'white',
      text: '#1a1a1a'
    }
  }

  const currentColors = colors[variant]

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* Shield Cart SVG Logo */}
      <svg
        width={shieldSize}
        height={shieldSize}
        viewBox="0 0 100 100"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id={`shield-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Hexagonal Shield Shape - Clean and Symmetrical */}
        <path
          d="M 50 8 L 85 25 L 85 65 L 50 92 L 15 65 L 15 25 Z"
          fill={variant === 'white' ? 'white' : `url(#shield-gradient-${size})`}
        />

        {/* Shopping Cart - Cleaner Design */}
        <g transform="translate(50, 50)">
          {/* Cart basket - rectangular with rounded bottom */}
          <rect
            x="-12"
            y="-10"
            width="18"
            height="16"
            rx="2"
            fill={currentColors.cart}
            stroke={currentColors.cart}
            strokeWidth="2"
          />

          {/* Cart handle */}
          <path
            d="M -12 -10 L -10 -15"
            stroke={currentColors.cart}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cart wheels - positioned below basket */}
          <circle cx="-8" cy="10" r="2.5" fill={currentColors.cart} />
          <circle cx="2" cy="10" r="2.5" fill={currentColors.cart} />
        </g>
      </svg>

      {/* Logo Text */}
      {showText && (
        <div className={`font-bold ${currentSize.text}`} style={{ color: currentColors.text }}>
          SafeCart
        </div>
      )}
    </div>
  )
}
