"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  FileImage, 
  FileSpreadsheet, 
  FileText, 
  Database,
  ChevronDown 
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface ExportDropdownProps {
  timetableData?: any
  elementId?: string
  className?: string
}

export default function ExportDropdown({ 
  timetableData, 
  elementId = 'timetable-grid',
  className = '' 
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    {
      id: 'png',
      label: 'Export as PNG',
      icon: FileImage,
      color: 'text-blue-400',
      description: 'High-quality image format'
    },
    {
      id: 'pdf',
      label: 'Export as PDF',
      icon: FileText,
      color: 'text-red-400',
      description: 'Portable document format'
    },
    {
      id: 'excel',
      label: 'Export as Excel',
      icon: FileSpreadsheet,
      color: 'text-green-400',
      description: 'Spreadsheet format'
    },
    {
      id: 'csv',
      label: 'Export as CSV',
      icon: Database,
      color: 'text-yellow-400',
      description: 'Comma-separated values'
    },
    {
      id: 'json',
      label: 'Export as JSON',
      icon: Database,
      color: 'text-purple-400',
      description: 'JavaScript object notation'
    }
  ]

  const handleExport = async (format: string) => {
    try {
      setIsExporting(true)
      toast.loading(`Exporting as ${format.toUpperCase()}...`)

      switch (format) {
        case 'png':
          await exportAsPNG()
          break
        case 'pdf':
          await exportAsPDF()
          break
        case 'excel':
          await exportAsExcel()
          break
        case 'csv':
          await exportAsCSV()
          break
        case 'json':
          await exportAsJSON()
          break
        default:
          throw new Error('Unsupported format')
      }

      toast.dismiss()
      toast.success(`Successfully exported as ${format.toUpperCase()}!`)
      setIsOpen(false)
    } catch (error) {
      toast.dismiss()
      toast.error(`Failed to export as ${format.toUpperCase()}`)
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsPNG = async () => {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Timetable element not found')
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#1e1b4b',
      scale: 2,
      logging: false,
      useCORS: true
    })

    const link = document.createElement('a')
    link.download = `timetable-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const exportAsPDF = async () => {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Timetable element not found')
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#1e1b4b',
      scale: 2,
      logging: false,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`timetable-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportAsExcel = async () => {
    const data = timetableData || generateSampleData()
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable')
    XLSX.writeFile(wb, `timetable-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportAsCSV = async () => {
    const data = timetableData || generateSampleData()
    const ws = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(ws)
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `timetable-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportAsJSON = async () => {
    const data = timetableData || generateSampleData()
    const json = JSON.stringify(data, null, 2)
    
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `timetable-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const generateSampleData = () => {
    return [
      { Time: '9:00-10:00', Monday: 'Mathematics', Tuesday: 'Physics', Wednesday: 'Chemistry', Thursday: 'Biology', Friday: 'English' },
      { Time: '10:00-11:00', Monday: 'Physics', Tuesday: 'Chemistry', Wednesday: 'Biology', Thursday: 'English', Friday: 'Mathematics' },
      { Time: '11:00-12:00', Monday: 'Chemistry', Tuesday: 'Biology', Wednesday: 'English', Thursday: 'Mathematics', Friday: 'Physics' },
      { Time: '12:00-13:00', Monday: 'LUNCH BREAK', Tuesday: 'LUNCH BREAK', Wednesday: 'LUNCH BREAK', Thursday: 'LUNCH BREAK', Friday: 'LUNCH BREAK' },
      { Time: '13:00-14:00', Monday: 'Biology', Tuesday: 'English', Wednesday: 'Mathematics', Thursday: 'Physics', Friday: 'Chemistry' },
      { Time: '14:00-15:00', Monday: 'English', Tuesday: 'Mathematics', Wednesday: 'Physics', Thursday: 'Chemistry', Friday: 'Biology' }
    ]
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 glass-card border border-purple-500/30 rounded-lg shadow-xl z-50"
          >
            <div className="p-2">
              <div className="text-sm font-medium text-purple-300 px-3 py-2 border-b border-purple-500/20">
                Export Options
              </div>
              
              {exportOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport(option.id)}
                  disabled={isExporting}
                  className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-purple-500/10 rounded-lg transition-colors disabled:opacity-50 group"
                >
                  <option.icon className={`w-5 h-5 ${option.color} group-hover:scale-110 transition-transform`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                </motion.button>
              ))}
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
