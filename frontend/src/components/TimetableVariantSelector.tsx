"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  X,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TimetableVariant {
  variant_id: number
  status: string
  solution: any[]
  metrics: {
    total_sessions: number
    room_utilization_percent: number
    teacher_load_balance: number
    daily_distribution_balance: number
    total_conflicts: number
    quality_score: number
  }
  solver_stats: {
    solve_time: number
    objective_value: number
    num_conflicts: number
    num_branches: number
  }
}

interface TimetableVariantSelectorProps {
  variants: TimetableVariant[]
  isOpen: boolean
  onClose: () => void
  onSelectVariant: (variant: TimetableVariant) => void
  onRegenerateVariants: () => void
  isRegenerating?: boolean
}

export function TimetableVariantSelector({
  variants,
  isOpen,
  onClose,
  onSelectVariant,
  onRegenerateVariants,
  isRegenerating = false
}: TimetableVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<TimetableVariant | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  const handleSelectVariant = (variant: TimetableVariant) => {
    setSelectedVariant(variant)
    onSelectVariant(variant)
    toast.success(`Selected Variant ${variant.variant_id} with ${variant.metrics.quality_score}% quality score`)
  }

  const successfulVariants = variants.filter(v => v.status === 'optimal' || v.status === 'feasible')

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] mx-4 glass-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">Select Timetable Variant</h2>
                <p className="text-gray-400 mt-1">
                  {successfulVariants.length} of {variants.length} variants generated successfully
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={onRegenerateVariants}
                  disabled={isRegenerating}
                  className="glass-button flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="glass-button p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {successfulVariants.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Feasible Solutions</h3>
                  <p className="text-gray-400 mb-6">
                    Unable to generate any feasible timetable variants. This might be due to:
                  </p>
                  <ul className="text-left text-gray-400 space-y-2 max-w-md mx-auto">
                    <li>• Insufficient rooms or time slots</li>
                    <li>• Conflicting teacher availability</li>
                    <li>• Over-constrained requirements</li>
                    <li>• Resource capacity limitations</li>
                  </ul>
                  <button
                    onClick={onRegenerateVariants}
                    className="glass-button bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 mt-6"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {successfulVariants.map((variant) => (
                    <motion.div
                      key={variant.variant_id}
                      whileHover={{ scale: 1.02 }}
                      className={`glass-card p-6 cursor-pointer transition-all ${
                        selectedVariant?.variant_id === variant.variant_id
                          ? 'ring-2 ring-blue-500 bg-blue-500/10'
                          : 'hover:bg-white/5'
                      }`}
                      onClick={() => handleSelectVariant(variant)}
                    >
                      {/* Variant Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{variant.variant_id}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">Variant {variant.variant_id}</h3>
                            <p className="text-xs text-gray-400 capitalize">{variant.status}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <div className={`text-2xl font-bold ${getQualityColor(variant.metrics.quality_score)}`}>
                            {variant.metrics.quality_score}%
                          </div>
                        </div>
                      </div>

                      {/* Quality Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          variant.metrics.quality_score >= 90 ? 'bg-green-500/20 text-green-400' :
                          variant.metrics.quality_score >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                          variant.metrics.quality_score >= 60 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {getQualityLabel(variant.metrics.quality_score)}
                        </span>
                      </div>

                      {/* Metrics */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">Sessions</span>
                          </div>
                          <span className="text-white font-medium">{variant.metrics.total_sessions}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">Room Util.</span>
                          </div>
                          <span className="text-white font-medium">{variant.metrics.room_utilization_percent}%</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">Load Balance</span>
                          </div>
                          <span className="text-white font-medium">{variant.metrics.teacher_load_balance}%</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-gray-300">Conflicts</span>
                          </div>
                          <span className={`font-medium ${variant.metrics.total_conflicts === 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {variant.metrics.total_conflicts}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="text-gray-300">Solve Time</span>
                          </div>
                          <span className="text-white font-medium">{variant.solver_stats.solve_time.toFixed(2)}s</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewMode(true)
                            setSelectedVariant(variant)
                          }}
                          className="flex-1 glass-button text-sm py-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </button>
                        
                        {selectedVariant?.variant_id === variant.variant_id && (
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {successfulVariants.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Select a variant to commit to your timetable database
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="glass-button px-6 py-2"
                  >
                    Cancel
                  </button>
                  
                  {selectedVariant && (
                    <button
                      onClick={() => handleSelectVariant(selectedVariant)}
                      className="glass-button bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Commit Variant {selectedVariant.variant_id}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
