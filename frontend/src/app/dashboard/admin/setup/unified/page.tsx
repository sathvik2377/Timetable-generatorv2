"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Layers,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  MapPin,
  Settings,
  Play,
  Save,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import UnifiedTimetableSetup from '@/components/UnifiedTimetableSetup'
import { TimetableVariantSelector } from '@/components/TimetableVariantSelector'
import { withAuth } from '@/lib/auth'
import { generateTimetableVariants } from '@/lib/apiUtils'
import toast from 'react-hot-toast'

function UnifiedSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [setupData, setSetupData] = useState({
    institution: {},
    branches: [],
    subjects: [],
    teachers: [],
    rooms: [],
    classGroups: [],
    constraints: []
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [variants, setVariants] = useState<any[]>([])
  const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const steps = [
    { id: 1, title: 'Institution Setup', icon: Settings, description: 'Configure basic institution details' },
    { id: 2, title: 'Branches & Departments', icon: Layers, description: 'Set up academic branches and departments' },
    { id: 3, title: 'Subjects & Curriculum', icon: BookOpen, description: 'Define subjects and course structure' },
    { id: 4, title: 'Faculty Management', icon: Users, description: 'Add teachers and their preferences' },
    { id: 5, title: 'Room & Resources', icon: MapPin, description: 'Configure classrooms and facilities' },
    { id: 6, title: 'Class Groups', icon: Users, description: 'Set up student groups and sections' },
    { id: 7, title: 'Constraints & Rules', icon: Settings, description: 'Define scheduling constraints' },
    { id: 8, title: 'Generate & Review', icon: Play, description: 'Generate and review timetable' }
  ]

  const handleStepComplete = (stepData: any) => {
    setSetupData(prev => ({ ...prev, ...stepData }))
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleGenerateTimetable = async () => {
    setIsGenerating(true)
    try {
      toast.loading('Generating unified timetable variants with OR-Tools...')

      const response = await generateTimetableVariants('unified', setupData)

      if (response.data.variants && response.data.variants.length > 0) {
        setVariants(response.data.variants)
        setShowVariantSelector(true)
        toast.dismiss()
        toast.success(`Generated ${response.data.variants.length} timetable variants!`)
      } else {
        toast.error('No valid timetable variants could be generated')
      }
    } catch (error: any) {
      console.error('Timetable generation error:', error)
      toast.error(error.response?.data?.error || 'Failed to generate timetable')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectVariant = async (variant: any) => {
    try {
      toast.loading('Committing selected timetable variant...')

      const token = document.cookie.split('access_token=')[1]?.split(';')[0]
      const response = await axios.post('http://localhost:8000/api/scheduler/commit-variant/', {
        variant: variant,
        name: `Unified Setup - Variant ${variant.variant_id}`,
        institution_id: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        toast.dismiss()
        toast.success('Timetable variant committed successfully!')

        // Auto-download as PNG
        if (response.data.download_url) {
          const link = document.createElement('a')
          link.href = response.data.download_url
          link.download = `unified_timetable_${new Date().toISOString().split('T')[0]}.png`
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

      const response = await generateTimetableVariants('unified', { ...setupData, regenerate: true })

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
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Unified Setup</h1>
                  <p className="text-sm text-gray-400">Comprehensive timetable setup wizard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                Step {currentStep} of {steps.length}
              </div>
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4">Setup Progress</h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      step.id === currentStep
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : step.id < currentStep
                        ? 'bg-green-500/20 border border-green-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id === currentStep
                        ? 'bg-orange-500'
                        : step.id < currentStep
                        ? 'bg-green-500'
                        : 'bg-white/10'
                    }`}>
                      {step.id < currentStep ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <step.icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        step.id <= currentStep ? 'text-white' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Setup Area */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {steps[currentStep - 1]?.title}
                </h2>
                <p className="text-gray-400">
                  {steps[currentStep - 1]?.description}
                </p>
              </div>

              {/* Unified Setup Component */}
              <UnifiedTimetableSetup
                currentStep={currentStep}
                setupData={setupData}
                onStepComplete={handleStepComplete}
                onGenerateTimetable={handleGenerateTimetable}
                isGenerating={isGenerating}
              />
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

export default withAuth(UnifiedSetupPage, ['admin'])
