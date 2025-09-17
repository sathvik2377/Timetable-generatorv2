"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Play,
  Eye,
  Copy,
  Star,
  Users,
  Clock,
  MapPin,
  GraduationCap,
  Building,
  Zap,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { withAuth } from '@/lib/auth'
import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'
import { generateTimetableVariants } from '@/lib/apiUtils'

function TemplateBasedPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  const templates = [
    {
      id: 'school-basic',
      name: 'Basic School Template',
      description: 'Simple template for primary and secondary schools',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
      rating: 4.8,
      usage: 1250,
      features: [
        '5-6 periods per day',
        'Single break system',
        'Basic subject allocation',
        'Simple room assignment'
      ],
      specs: {
        classes: '5-15 classes',
        teachers: '10-30 teachers',
        subjects: '8-12 subjects',
        rooms: '10-20 rooms'
      }
    },
    {
      id: 'college-engineering',
      name: 'Engineering College',
      description: 'Comprehensive template for engineering institutions',
      icon: Building,
      color: 'from-purple-500 to-pink-500',
      rating: 4.9,
      usage: 890,
      features: [
        'Lab session management',
        'Multiple branches',
        'Semester-based system',
        'Faculty specialization'
      ],
      specs: {
        classes: '20-50 classes',
        teachers: '50-150 teachers',
        subjects: '30-80 subjects',
        rooms: '30-100 rooms'
      }
    },
    {
      id: 'university-multi',
      name: 'Multi-Faculty University',
      description: 'Large-scale template for universities with multiple faculties',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      rating: 4.7,
      usage: 456,
      features: [
        'Multi-faculty support',
        'Cross-faculty subjects',
        'Resource sharing',
        'Complex scheduling'
      ],
      specs: {
        classes: '100+ classes',
        teachers: '200+ teachers',
        subjects: '100+ subjects',
        rooms: '100+ rooms'
      }
    },
    {
      id: 'medical-college',
      name: 'Medical College',
      description: 'Specialized template for medical education institutions',
      icon: Building,
      color: 'from-red-500 to-orange-500',
      rating: 4.6,
      usage: 234,
      features: [
        'Clinical rotations',
        'Hospital integration',
        'Practical sessions',
        'Residency scheduling'
      ],
      specs: {
        classes: '10-25 classes',
        teachers: '30-100 teachers',
        subjects: '20-40 subjects',
        rooms: '20-60 rooms'
      }
    },
    {
      id: 'business-school',
      name: 'Business School',
      description: 'Template optimized for MBA and business programs',
      icon: Building,
      color: 'from-yellow-500 to-orange-500',
      rating: 4.5,
      usage: 567,
      features: [
        'Case study sessions',
        'Group project time',
        'Industry visits',
        'Flexible scheduling'
      ],
      specs: {
        classes: '15-40 classes',
        teachers: '25-80 teachers',
        subjects: '15-35 subjects',
        rooms: '15-50 rooms'
      }
    },
    {
      id: 'arts-college',
      name: 'Arts & Science College',
      description: 'Balanced template for liberal arts and science programs',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500',
      rating: 4.4,
      usage: 789,
      features: [
        'Diverse subject mix',
        'Elective management',
        'Lab coordination',
        'Seminar scheduling'
      ],
      specs: {
        classes: '25-60 classes',
        teachers: '40-120 teachers',
        subjects: '25-70 subjects',
        rooms: '25-80 rooms'
      }
    }
  ]

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template)
  }

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    try {
      toast.loading(`Generating timetable using ${selectedTemplate.name} template...`)

      const response = await generateTimetableVariants('template', {
        template: selectedTemplate,
        template_id: selectedTemplate.id
      })

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.dismiss()
        toast.success(`Generated ${response.data.variants.length} template-based variants!`)
      } else {
        toast.error('No timetable variants generated')
      }
    } catch (error: any) {
      console.error('Template generation error:', error)
      toast.error(error.response?.data?.error || 'Failed to generate template-based timetable')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateVariants = async () => {
    if (!selectedTemplate) return

    setIsRegenerating(true)
    try {
      toast.loading('Regenerating template-based variants...')

      const response = await generateTimetableVariants('template', {
        template: selectedTemplate,
        template_id: selectedTemplate.id
      })

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        toast.dismiss()
        toast.success(`Regenerated ${response.data.variants.length} new variants!`)
      }
    } catch (error: any) {
      console.error('Regeneration error:', error)
      toast.error('Failed to regenerate variants')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handlePreviewTemplate = (template: any) => {
    setPreviewTemplate(template)
    setShowPreview(true)
    toast.success(`Opening preview for ${template.name} template`)
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
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Template Based Setup</h1>
                  <p className="text-sm text-gray-400">Choose from pre-built templates for quick setup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Choose a Template</h2>
              <p className="text-gray-400">Select a pre-built template that matches your institution type</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className={`glass-card p-6 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-yellow-500 bg-yellow-500/10'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center`}>
                      <template.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-300">{template.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{template.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Used by</span>
                      <span className="text-white">{template.usage.toLocaleString()} institutions</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(template.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{key}:</span>
                          <span className="text-white">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewTemplate(template)
                          }}
                          className="flex-1 glass-button py-2 text-sm"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </button>
                        {selectedTemplate?.id === template.id && (
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Selected Template Details */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-8">
              {selectedTemplate ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Template Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${selectedTemplate.color} rounded-lg flex items-center justify-center`}>
                        <selectedTemplate.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{selectedTemplate.name}</h4>
                        <p className="text-sm text-gray-400">{selectedTemplate.usage} users</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-white mb-2">Key Features</h5>
                      <ul className="space-y-1">
                        {selectedTemplate.features.map((feature: string, index: number) => (
                          <li key={index} className="text-sm text-gray-400 flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-white mb-2">Specifications</h5>
                      <div className="space-y-2">
                        {Object.entries(selectedTemplate.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-400 capitalize">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleUseTemplate}
                      disabled={isGenerating}
                      className="w-full glass-button bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium py-3 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="spinner" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Play className="w-4 h-4" />
                          <span>Use This Template</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-white mb-2">Select a Template</h3>
                  <p className="text-gray-400 text-sm">Choose a template from the list to see details and generate your timetable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Timetable Variant Selector Modal */}
      {showVariantSelector && (
        <TimetableVariantSelector
          variants={variants}
          onClose={() => setShowVariantSelector(false)}
          onRegenerate={handleRegenerateVariants}
          isRegenerating={isRegenerating}
          setupMode="template"
        />
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Template Preview: {previewTemplate.name}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300">{previewTemplate.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                    {previewTemplate.features?.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suitable For</h4>
                  <p className="text-gray-600 dark:text-gray-300">{previewTemplate.suitableFor}</p>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedTemplate(previewTemplate)
                    setShowPreview(false)
                    toast.success(`Selected ${previewTemplate.name} template`)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default withAuth(TemplateBasedPage, ['admin'])
