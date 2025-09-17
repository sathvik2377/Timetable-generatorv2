"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { User } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication and load user data
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Redirect to appropriate dashboard based on role
      if (pathname === '/dashboard') {
        router.push(`/dashboard/${parsedUser.role}`)
        return
      }
      
      // Check if user is accessing correct role dashboard
      const currentRole = pathname.split('/')[2]
      if (currentRole && currentRole !== parsedUser.role) {
        router.push(`/dashboard/${parsedUser.role}`)
        return
      }
      
    } catch (error) {
      console.error('Failed to parse user data:', error)
      localStorage.removeItem('user')
      router.push('/login')
      return
    }
    
    setLoading(false)
  }, [router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to">
      <DashboardNav
        userRole={user.role}
        userName={user.display_name || `${user.first_name} ${user.last_name}`}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {children}
      </div>
    </div>
  )
}
