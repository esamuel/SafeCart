import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SafeCart - Safe Grocery Shopping',
  description: 'AI-powered grocery shopping for allergies and diabetes. Shop safely, live confidently.',
  keywords: ['grocery shopping', 'allergies', 'diabetes', 'safe shopping', 'health', 'barcode scanner'],
  authors: [{ name: 'SafeCart Team' }],
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
