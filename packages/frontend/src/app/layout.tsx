import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7C3AED', // Purple-600
}

export const metadata: Metadata = {
  title: 'SafeCart - Safe Grocery Shopping',
  description: 'AI-powered grocery shopping for allergies and diabetes. Shop safely, live confidently.',
  keywords: ['grocery shopping', 'allergies', 'diabetes', 'safe shopping', 'health', 'barcode scanner'],
  authors: [{ name: 'SafeCart Team' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SafeCart',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'SafeCart - Safe Grocery Shopping',
    description: 'AI-powered grocery shopping for allergies and diabetes. Shop safely, live confidently.',
    type: 'website',
    siteName: 'SafeCart',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'SafeCart - Shop safely, live confidently',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeCart - Safe Grocery Shopping',
    description: 'AI-powered grocery shopping for allergies and diabetes',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
