import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getSubjectTypeColor(type: string): string {
  const colors = {
    core: 'bg-blue-500/20 border-blue-500/30 text-blue-100',
    elective: 'bg-green-500/20 border-green-500/30 text-green-100',
    lab: 'bg-orange-500/20 border-orange-500/30 text-orange-100',
    skill: 'bg-purple-500/20 border-purple-500/30 text-purple-100',
    project: 'bg-red-500/20 border-red-500/30 text-red-100',
  }
  return colors[type as keyof typeof colors] || colors.core
}

export function getDayName(dayIndex: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayIndex] || 'Unknown'
}

export function generateTimeSlots(startTime: string, endTime: string, duration: number, lunchStart?: string, lunchEnd?: string): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  const lunchStartTime = lunchStart ? new Date(`2000-01-01T${lunchStart}`) : null
  const lunchEndTime = lunchEnd ? new Date(`2000-01-01T${lunchEnd}`) : null
  
  let current = new Date(start)
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + duration * 60000)
    
    // Skip lunch break
    if (lunchStartTime && lunchEndTime) {
      if (!(current >= lunchStartTime && slotEnd <= lunchEndTime)) {
        slots.push(`${current.toTimeString().slice(0, 5)}-${slotEnd.toTimeString().slice(0, 5)}`)
      }
    } else {
      slots.push(`${current.toTimeString().slice(0, 5)}-${slotEnd.toTimeString().slice(0, 5)}`)
    }
    
    current = slotEnd
  }
  
  return slots
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
