'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye
} from 'lucide-react'

interface TemplateUploadSectionProps {
  title: string
  description: string
  templateType: string
  data: any[]
  onFileUpload: (file: File) => void
  onTemplateDownload: () => void
}

export default function TemplateUploadSection({
  title,
  description,
  templateType,
  data,
  onFileUpload,
  onTemplateDownload
}: TemplateUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      onFileUpload(file)
    } else {
      alert('Please upload an Excel (.xlsx) or CSV file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {data.length > 0 && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview ({data.length})</span>
              </button>
            )}
            
            <button
              onClick={onTemplateDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${data.length > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {data.length > 0 ? (
            <div className="space-y-2">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="text-lg font-medium text-green-700 dark:text-green-300">
                Data Uploaded Successfully!
              </h4>
              <p className="text-sm text-green-600 dark:text-green-400">
                {data.length} entries loaded from your file
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Upload a different file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Upload {templateType} data
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop your Excel file here, or click to browse
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose File</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Preview */}
        {showPreview && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
          >
            <div className="bg-gray-100 dark:bg-gray-600 px-4 py-2 flex items-center justify-between">
              <h5 className="font-medium text-gray-900 dark:text-white">Data Preview</h5>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {data.length > 0 && Object.keys(data[0]).map(key => (
                      <th key={key} className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-gray-900 dark:text-gray-100">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.length > 5 && (
                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                  ... and {data.length - 5} more entries
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Help Text */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Template Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• Download the template first to see the required format</li>
                <li>• Do not modify column headers in the template</li>
                <li>• Fill in all required fields for each row</li>
                <li>• Save as Excel (.xlsx) or CSV format before uploading</li>
                <li>• Check the preview to ensure data was imported correctly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
