"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image, 
  Calendar,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { downloadFile } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  exportTimetableAsPNG,
  exportTimetableAsPDF,
  exportTimetableAsExcel,
  exportTimetableAsCSV,
  extractTimetableData,
  generateExportOptions
} from '@/lib/exportUtils'

interface ExportMenuProps {
  timetableId?: number
  institutionId?: number
  timetable?: any // The actual timetable data
  type?: 'timetable' | 'analytics'
  className?: string
}

export function ExportMenu({ timetableId, institutionId, timetable, type = 'timetable', className = '' }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<string | null>(null)

  const exportFormats = [
    {
      id: 'pdf',
      label: 'PDF Document',
      description: 'Printable timetable with professional formatting',
      icon: FileText,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      id: 'excel',
      label: 'Excel Spreadsheet',
      description: 'Editable spreadsheet format for further analysis',
      icon: FileSpreadsheet,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'png',
      label: 'PNG Image',
      description: 'High-quality image for presentations',
      icon: Image,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'csv',
      label: 'CSV File',
      description: 'Comma-separated values for data analysis',
      icon: FileSpreadsheet,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ]

  const handleExport = async (format: string) => {
    if (!timetable && !timetableId) {
      toast.error('Please generate a timetable first')
      return
    }

    setExportingFormat(format)

    try {
      if (type === 'timetable') {
        const timetableData = extractTimetableData(timetable)
        const exportOptions = generateExportOptions(timetable || { name: `Timetable ${timetableId}` })

        switch (format) {
          case 'pdf':
            await exportTimetableAsPDF('timetable-grid', exportOptions)
            break
          case 'excel':
            exportTimetableAsExcel(timetableData, exportOptions)
            break
          case 'png':
            await exportTimetableAsPNG('timetable-grid', exportOptions)
            break
          case 'csv':
            exportTimetableAsCSV(timetableData, exportOptions)
            break
          default:
            throw new Error('Unsupported format')
        }
      } else if (type === 'analytics') {
        // For analytics, create a simple export
        const csvContent = `Analytics Export\nInstitution ID: ${institutionId}\nTimetable ID: ${timetableId}\nExport Date: ${new Date().toLocaleDateString()}`
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics-${institutionId}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      toast.success(`${format.toUpperCase()} exported successfully!`)
      setIsOpen(false)

    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to export ${format.toUpperCase()}. Please try again.`)
    } finally {
      setExportingFormat(null)
    }
  }

  const filteredFormats = type === 'analytics' 
    ? exportFormats.filter(f => ['pdf', 'excel'].includes(f.id))
    : exportFormats

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center space-x-2"
        disabled={exportingFormat !== null}
      >
        {exportingFormat ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 glass-card p-4 z-50 border border-white/10"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white mb-3">Choose Export Format</h3>
              
              {filteredFormats.map((format) => (
                <motion.button
                  key={format.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport(format.id)}
                  disabled={exportingFormat !== null}
                  className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${format.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {exportingFormat === format.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <format.icon className={`w-5 h-5 ${format.color}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-white">{format.label}</p>
                        {exportingFormat === format.id && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{format.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <CheckCircle className="w-3 h-3" />
                <span>Files will be downloaded automatically</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Export button for quick access
export function QuickExportButton({ timetableId, format = 'pdf', className = '' }: { 
  timetableId?: number
  format?: string
  className?: string 
}) {
  const [isExporting, setIsExporting] = useState(false)

  const handleQuickExport = async () => {
    if (!timetableId) {
      toast.error('Please generate a timetable first')
      return
    }

    setIsExporting(true)
    
    try {
      let response: Blob
      let filename: string
      
      switch (format) {
        case 'pdf':
          response = await apiClient.exportTimetablePDF(timetableId)
          filename = `timetable-${timetableId}.pdf`
          break
        case 'excel':
          response = await apiClient.exportTimetableExcel(timetableId)
          filename = `timetable-${timetableId}.xlsx`
          break
        default:
          throw new Error('Unsupported format')
      }

      downloadFile(response, filename)
      toast.success(`${format.toUpperCase()} exported successfully!`)
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Failed to export ${format.toUpperCase()}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleQuickExport}
      disabled={isExporting}
      className={`glass-button flex items-center space-x-2 ${className}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Export {format.toUpperCase()}</span>
        </>
      )}
    </motion.button>
  )
}
