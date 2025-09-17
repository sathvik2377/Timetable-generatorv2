"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Eye,
  Play,
  FileText,
  Users,
  BookOpen,
  MapPin,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'
import { withAuth } from '@/lib/auth'
import { generateTimetableVariants } from '@/lib/apiUtils'

function ExcelImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [validationResults, setValidationResults] = useState<any[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const templateTypes = [
    {
      id: 'institution',
      name: 'Institution Details',
      icon: FileText,
      description: 'Basic institution information and settings',
      filename: 'institution_template.xlsx'
    },
    {
      id: 'teachers',
      name: 'Teachers & Faculty',
      icon: Users,
      description: 'Faculty information, subjects, and availability',
      filename: 'teachers_template.xlsx'
    },
    {
      id: 'subjects',
      name: 'Subjects & Curriculum',
      icon: BookOpen,
      description: 'Subject details, credits, and prerequisites',
      filename: 'subjects_template.xlsx'
    },
    {
      id: 'rooms',
      name: 'Rooms & Facilities',
      icon: MapPin,
      description: 'Classroom information and capacity',
      filename: 'rooms_template.xlsx'
    },
    {
      id: 'classes',
      name: 'Class Groups',
      icon: Users,
      description: 'Student groups and class sections',
      filename: 'classes_template.xlsx'
    },
    {
      id: 'constraints',
      name: 'Scheduling Constraints',
      icon: Calendar,
      description: 'Time constraints and scheduling rules',
      filename: 'constraints_template.xlsx'
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'uploaded',
      errors: [],
      warnings: []
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    validateFiles(newFiles)
  }

  const validateFiles = async (files: any[]) => {
    setIsValidating(true)
    
    // Simulate validation process
    for (const file of files) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation results
      const mockValidation = {
        fileId: file.id,
        isValid: Math.random() > 0.3,
        errors: Math.random() > 0.7 ? ['Missing required column: Subject Code'] : [],
        warnings: Math.random() > 0.5 ? ['Some teacher availability data is missing'] : [],
        recordCount: Math.floor(Math.random() * 100) + 10
      }
      
      setValidationResults(prev => [...prev, mockValidation])
      
      // Update file status
      setUploadedFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, status: mockValidation.isValid ? 'valid' : 'error' }
          : f
      ))
    }
    
    setIsValidating(false)
  }

  const downloadTemplate = (template: any) => {
    // In a real app, this would download the actual template
    toast.success(`Downloading ${template.filename}`)
  }

  const handleGenerateTimetable = async () => {
    const validFiles = uploadedFiles.filter(f => f.status === 'valid')
    if (validFiles.length === 0) {
      toast.error('Please upload and validate at least one file')
      return
    }

    setIsGenerating(true)
    try {
      toast.loading('Generating timetable variants from Excel data with OR-Tools...')

      const response = await generateTimetableVariants('excel_import', { uploaded_files: validFiles })

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.dismiss()
        toast.success(`Generated ${response.data.variants.length} timetable variants from Excel data!`)
      } else {
        toast.error('No valid timetable variants could be generated from Excel data')
      }
    } catch (error: any) {
      console.error('Timetable generation error:', error)
      toast.error(error.response?.data?.error || 'Failed to generate timetable from Excel data')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectVariant = async (variant: any) => {
    try {
      toast.loading('Committing selected timetable variant...')

      const response = await axios.post('http://localhost:8000/api/scheduler/commit-variant/', {
        variant_id: variant.id,
        setup_mode: 'excel_import'
      })

      if (response.data.success) {
        toast.dismiss()
        toast.success('Timetable variant committed successfully!')

        // Auto-download as PNG
        if (response.data.download_url) {
          const link = document.createElement('a')
          link.href = response.data.download_url
          link.download = `excel_import_timetable_${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        setShowVariantSelector(false)
        router.push('/dashboard/admin')
      }
    } catch (error: any) {
      console.error('Commit variant error:', error)
      toast.error(error.response?.data?.error || 'Failed to commit timetable variant')
    }
  }

  const handleRegenerateVariants = async () => {
    setIsRegenerating(true)
    try {
      toast.loading('Regenerating timetable variants...')

      const response = await generateTimetableVariants('excel_import', {
        uploaded_files: uploadedFiles.filter(f => f.status === 'valid'),
        regenerate: true
      })

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        toast.dismiss()
        toast.success(`Regenerated ${response.data.variants.length} new variants!`)
      }
    } catch (error: any) {
      console.error('Regenerate variants error:', error)
      toast.error(error.response?.data?.error || 'Failed to regenerate variants')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="glass-button p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Excel Import</h1>
                  <p className="text-sm text-gray-400">Import timetable data from Excel spreadsheets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Templates Section */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Download Templates
              </h2>
              <p className="text-gray-400 mb-6">
                Download Excel templates to ensure your data is in the correct format
              </p>
              
              <div className="space-y-3">
                {templateTypes.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <template.icon className="w-5 h-5 text-teal-400" />
                      <div>
                        <h3 className="font-medium text-white">{template.name}</h3>
                        <p className="text-sm text-gray-400">{template.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="glass-button px-4 py-2 text-sm"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </h2>
              
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Click to upload Excel files</p>
                <p className="text-gray-400 text-sm">Supports .xlsx, .xls files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-white">Uploaded Files</h3>
                  {uploadedFiles.map((file) => {
                    const validation = validationResults.find(v => v.fileId === file.id)
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            file.status === 'valid' ? 'bg-green-500' :
                            file.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                            {file.status === 'valid' ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : file.status === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-white" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{file.name}</p>
                            <p className="text-sm text-gray-400">
                              {(file.size / 1024).toFixed(1)} KB
                              {validation && ` • ${validation.recordCount} records`}
                            </p>
                          </div>
                        </div>
                        <button className="glass-button p-2">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Generate Button */}
              {uploadedFiles.some(f => f.status === 'valid') && (
                <div className="mt-6">
                  <button
                    onClick={handleGenerateTimetable}
                    disabled={isGenerating}
                    className="w-full glass-button bg-gradient-to-r from-teal-500 to-green-500 text-white font-medium py-3 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="spinner" />
                        <span>Generating Timetable...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Generate Timetable</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Timetable Variant Selector Modal */}
      <TimetableVariantSelector
        variants={variants}
        isOpen={showVariantSelector}
        onClose={() => setShowVariantSelector(false)}
        onSelectVariant={handleSelectVariant}
        onRegenerateVariants={handleRegenerateVariants}
        isRegenerating={isRegenerating}
      />
    </div>
  )
}

export default withAuth(ExcelImportPage, ['admin'])
