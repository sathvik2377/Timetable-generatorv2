import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/footer'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Academic Timetable Scheduler',
  description: 'Intelligent timetable scheduling system for educational institutions',
  keywords: ['timetable', 'scheduler', 'academic', 'AI', 'education', 'NEP 2020'],
  authors: [{ name: 'Smart India Hackathon Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen bg-grid-pattern">
              {children}
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'glass-card',
                style: {
                  backdropFilter: 'blur(10px)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
