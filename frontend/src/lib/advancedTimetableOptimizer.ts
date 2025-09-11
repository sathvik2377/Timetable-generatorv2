import { TimetableGenerationData } from './templateManager'
import {
  AdvancedConflictResolver,
  ResolutionContext,
  TeacherPreference,
  SubjectRequirement,
  InstitutionConstraints,
  createAdvancedConflictResolver
} from './advancedConflictResolver'

export interface AdvancedOptimizationConfig {
  maxIterations: number
  populationSize: number
  mutationRate: number
  crossoverRate: number
  elitismRate: number
  convergenceThreshold: number
  weightings: {
    teacherConflicts: number
    roomConflicts: number
    classConflicts: number
    teacherPreferences: number
    roomUtilization: number
    timeDistribution: number
    consecutiveHours: number
    lunchBreakViolations: number
  }
}

export interface TimeSlot {
  day: number // 0-6 (Monday-Sunday)
  period: number // 0-based period index
  startTime: string
  endTime: string
  isBreak?: boolean
}

export interface ScheduleSession {
  id: string
  subjectId: string
  teacherId: string
  roomId: string
  classGroupId: string
  timeSlot: TimeSlot
  sessionType: 'theory' | 'practical' | 'lab' | 'tutorial'
  duration: number // in minutes
}

export interface ConflictInfo {
  type: 'teacher' | 'room' | 'class' | 'preference' | 'constraint'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedSessions: string[]
  suggestedFix?: string
  resolved?: boolean
  resolutionMethod?: string
}

export interface OptimizationResult {
  schedule: ScheduleSession[]
  conflicts: ConflictInfo[]
  resolvedConflicts?: ConflictInfo[]
  optimizationScore: number
  iterations: number
  convergenceReached: boolean
  resolutionSummary?: {
    totalConflicts: number
    resolvedConflicts: number
    resolutionRate: number
    resolutionMethods: string[]
  }
  statistics: {
    totalSessions: number
    conflictsResolved: number
    teacherUtilization: number
    roomUtilization: number
    timeDistribution: number[]
    averageGapsBetweenClasses: number
  }
}

export class AdvancedTimetableOptimizer {
  private config: AdvancedOptimizationConfig
  private data: TimetableGenerationData
  private timeSlots: TimeSlot[]
  private population: ScheduleSession[][]
  private bestSolution: ScheduleSession[] | null = null
  private bestScore: number = 0

  constructor(data: TimetableGenerationData, config?: Partial<AdvancedOptimizationConfig>) {
    this.data = data
    this.config = {
      maxIterations: 1000,
      populationSize: 50,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismRate: 0.2,
      convergenceThreshold: 0.001,
      weightings: {
        teacherConflicts: 10.0,
        roomConflicts: 8.0,
        classConflicts: 10.0,
        teacherPreferences: 3.0,
        roomUtilization: 2.0,
        timeDistribution: 4.0,
        consecutiveHours: 5.0,
        lunchBreakViolations: 7.0
      },
      ...config
    }
    this.timeSlots = this.generateTimeSlots()
    this.population = []
  }

  private generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = []
    const preferences = this.data.preferences
    const startHour = parseInt(preferences.startTime.split(':')[0])
    const endHour = parseInt(preferences.endTime.split(':')[0])
    const slotDuration = preferences.periodDuration || 60
    
    const workingDays = preferences.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const dayMap = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 }

    workingDays.forEach(dayName => {
      const dayIndex = dayMap[dayName as keyof typeof dayMap]
      let currentHour = startHour
      let period = 0

      while (currentHour < endHour) {
        const startTime = `${String(currentHour).padStart(2, '0')}:00`
        const endTime = `${String(currentHour + 1).padStart(2, '0')}:00`
        
        // Check for lunch break
        const lunchStart = preferences.lunchBreak?.split('-')[0] || '13:00'
        const lunchEnd = preferences.lunchBreak?.split('-')[1] || '14:00'
        const lunchStartHour = parseInt(lunchStart.split(':')[0])
        const lunchEndHour = parseInt(lunchEnd.split(':')[0])
        
        if (currentHour >= lunchStartHour && currentHour < lunchEndHour) {
          slots.push({
            day: dayIndex,
            period,
            startTime,
            endTime,
            isBreak: true
          })
        } else {
          slots.push({
            day: dayIndex,
            period,
            startTime,
            endTime
          })
        }
        
        currentHour++
        period++
      }
    })

    return slots
  }

  private createRandomSchedule(): ScheduleSession[] {
    const schedule: ScheduleSession[] = []
    const usedSlots = new Set<string>()
    
    // Create sessions for each subject requirement
    this.data.subjects.forEach(subject => {
      const totalHours = (subject.theory_hours || 0) + (subject.practical_hours || 0)
      
      for (let hour = 0; hour < totalHours; hour++) {
        const sessionType = hour < (subject.theory_hours || 0) ? 'theory' : 'practical'
        
        // Find available teachers for this subject
        const availableTeachers = this.data.teachers.filter(teacher => 
          teacher.specialization?.toLowerCase().includes(subject.name.toLowerCase()) ||
          teacher.subjects?.includes(subject.id)
        )
        
        if (availableTeachers.length === 0) continue
        
        const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)]
        
        // Find available rooms
        const roomType = sessionType === 'practical' ? 'laboratory' : 'classroom'
        const availableRooms = this.data.rooms.filter(room => 
          room.type === roomType || room.type === 'classroom'
        )
        
        if (availableRooms.length === 0) continue
        
        const room = availableRooms[Math.floor(Math.random() * availableRooms.length)]
        
        // Find available time slot
        const availableSlots = this.timeSlots.filter(slot => 
          !slot.isBreak && !usedSlots.has(`${slot.day}-${slot.period}-${teacher.id}-${room.id}`)
        )
        
        if (availableSlots.length === 0) continue
        
        const timeSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)]
        
        const session: ScheduleSession = {
          id: `session-${schedule.length + 1}`,
          subjectId: subject.id.toString(),
          teacherId: teacher.id.toString(),
          roomId: room.id.toString(),
          classGroupId: subject.branch?.toString() || '1',
          timeSlot,
          sessionType: sessionType as 'theory' | 'practical',
          duration: 60
        }
        
        schedule.push(session)
        usedSlots.add(`${timeSlot.day}-${timeSlot.period}-${teacher.id}-${room.id}`)
      }
    })
    
    return schedule
  }

  private evaluateFitness(schedule: ScheduleSession[]): number {
    let score = 100.0
    const conflicts = this.detectConflicts(schedule)
    
    // Penalize conflicts based on severity and type
    conflicts.forEach(conflict => {
      const weight = this.config.weightings[conflict.type as keyof typeof this.config.weightings] || 1
      const severityMultiplier = {
        low: 0.5,
        medium: 1.0,
        high: 2.0,
        critical: 5.0
      }[conflict.severity]
      
      score -= weight * severityMultiplier
    })
    
    // Reward good distribution
    score += this.calculateDistributionBonus(schedule)
    score += this.calculateUtilizationBonus(schedule)
    
    return Math.max(0, score)
  }

  private detectConflicts(schedule: ScheduleSession[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = []
    const timeSlotMap = new Map<string, ScheduleSession[]>()
    
    // Group sessions by time slot
    schedule.forEach(session => {
      const key = `${session.timeSlot.day}-${session.timeSlot.period}`
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, [])
      }
      timeSlotMap.get(key)!.push(session)
    })
    
    // Check for conflicts in each time slot
    timeSlotMap.forEach((sessions, timeKey) => {
      if (sessions.length <= 1) return
      
      // Teacher conflicts
      const teacherMap = new Map<string, ScheduleSession[]>()
      sessions.forEach(session => {
        if (!teacherMap.has(session.teacherId)) {
          teacherMap.set(session.teacherId, [])
        }
        teacherMap.get(session.teacherId)!.push(session)
      })
      
      teacherMap.forEach((teacherSessions, teacherId) => {
        if (teacherSessions.length > 1) {
          conflicts.push({
            type: 'teacher',
            severity: 'critical',
            description: `Teacher ${teacherId} has multiple sessions at ${timeKey}`,
            affectedSessions: teacherSessions.map(s => s.id),
            suggestedFix: 'Reschedule one of the conflicting sessions'
          })
        }
      })
      
      // Room conflicts
      const roomMap = new Map<string, ScheduleSession[]>()
      sessions.forEach(session => {
        if (!roomMap.has(session.roomId)) {
          roomMap.set(session.roomId, [])
        }
        roomMap.get(session.roomId)!.push(session)
      })
      
      roomMap.forEach((roomSessions, roomId) => {
        if (roomSessions.length > 1) {
          conflicts.push({
            type: 'room',
            severity: 'high',
            description: `Room ${roomId} has multiple sessions at ${timeKey}`,
            affectedSessions: roomSessions.map(s => s.id),
            suggestedFix: 'Assign different rooms or reschedule'
          })
        }
      })
      
      // Class conflicts
      const classMap = new Map<string, ScheduleSession[]>()
      sessions.forEach(session => {
        if (!classMap.has(session.classGroupId)) {
          classMap.set(session.classGroupId, [])
        }
        classMap.get(session.classGroupId)!.push(session)
      })
      
      classMap.forEach((classSessions, classId) => {
        if (classSessions.length > 1) {
          conflicts.push({
            type: 'class',
            severity: 'critical',
            description: `Class ${classId} has multiple sessions at ${timeKey}`,
            affectedSessions: classSessions.map(s => s.id),
            suggestedFix: 'Reschedule conflicting sessions'
          })
        }
      })
    })
    
    return conflicts
  }

  private calculateDistributionBonus(schedule: ScheduleSession[]): number {
    // Calculate how evenly sessions are distributed across time slots
    const slotCounts = new Map<string, number>()
    
    schedule.forEach(session => {
      const key = `${session.timeSlot.day}-${session.timeSlot.period}`
      slotCounts.set(key, (slotCounts.get(key) || 0) + 1)
    })
    
    const counts = Array.from(slotCounts.values())
    if (counts.length === 0) return 0
    
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length
    
    // Lower variance is better (more even distribution)
    return Math.max(0, 10 - variance)
  }

  private calculateUtilizationBonus(schedule: ScheduleSession[]): number {
    const teacherHours = new Map<string, number>()
    const roomHours = new Map<string, number>()
    
    schedule.forEach(session => {
      teacherHours.set(session.teacherId, (teacherHours.get(session.teacherId) || 0) + 1)
      roomHours.set(session.roomId, (roomHours.get(session.roomId) || 0) + 1)
    })
    
    // Calculate utilization efficiency
    const teacherUtilization = Array.from(teacherHours.values())
    const roomUtilization = Array.from(roomHours.values())
    
    const avgTeacherHours = teacherUtilization.reduce((sum, hours) => sum + hours, 0) / Math.max(teacherUtilization.length, 1)
    const avgRoomHours = roomUtilization.reduce((sum, hours) => sum + hours, 0) / Math.max(roomUtilization.length, 1)
    
    // Reward balanced utilization (not too high, not too low)
    const idealTeacherHours = 20 // per week
    const idealRoomHours = 30 // per week
    
    const teacherBonus = Math.max(0, 5 - Math.abs(avgTeacherHours - idealTeacherHours) / 5)
    const roomBonus = Math.max(0, 5 - Math.abs(avgRoomHours - idealRoomHours) / 10)
    
    return teacherBonus + roomBonus
  }

  public optimize(): OptimizationResult {
    // Initialize population
    for (let i = 0; i < this.config.populationSize; i++) {
      this.population.push(this.createRandomSchedule())
    }
    
    let iteration = 0
    let lastBestScore = 0
    let convergenceCounter = 0
    
    while (iteration < this.config.maxIterations) {
      // Evaluate fitness for all individuals
      const fitnessScores = this.population.map(schedule => this.evaluateFitness(schedule))
      
      // Find best solution
      const bestIndex = fitnessScores.indexOf(Math.max(...fitnessScores))
      const currentBestScore = fitnessScores[bestIndex]
      
      if (currentBestScore > this.bestScore) {
        this.bestScore = currentBestScore
        this.bestSolution = [...this.population[bestIndex]]
      }
      
      // Check for convergence
      if (Math.abs(currentBestScore - lastBestScore) < this.config.convergenceThreshold) {
        convergenceCounter++
        if (convergenceCounter >= 50) break // Converged
      } else {
        convergenceCounter = 0
      }
      
      lastBestScore = currentBestScore
      
      // Create next generation
      const newPopulation: ScheduleSession[][] = []
      
      // Elitism: keep best solutions
      const eliteCount = Math.floor(this.config.populationSize * this.config.elitismRate)
      const sortedIndices = fitnessScores
        .map((score, index) => ({ score, index }))
        .sort((a, b) => b.score - a.score)
        .slice(0, eliteCount)
        .map(item => item.index)
      
      sortedIndices.forEach(index => {
        newPopulation.push([...this.population[index]])
      })
      
      // Generate offspring through crossover and mutation
      while (newPopulation.length < this.config.populationSize) {
        const parent1 = this.tournamentSelection(fitnessScores)
        const parent2 = this.tournamentSelection(fitnessScores)
        
        let offspring = this.crossover(parent1, parent2)
        offspring = this.mutate(offspring)
        
        newPopulation.push(offspring)
      }
      
      this.population = newPopulation
      iteration++
    }
    
    const finalSchedule = this.bestSolution || []
    const conflicts = this.detectConflicts(finalSchedule)
    
    return {
      schedule: finalSchedule,
      conflicts,
      optimizationScore: this.bestScore,
      iterations: iteration,
      convergenceReached: convergenceCounter >= 50,
      statistics: {
        totalSessions: finalSchedule.length,
        conflictsResolved: Math.max(0, 100 - conflicts.length),
        teacherUtilization: this.calculateTeacherUtilization(finalSchedule),
        roomUtilization: this.calculateRoomUtilization(finalSchedule),
        timeDistribution: this.calculateTimeDistribution(finalSchedule),
        averageGapsBetweenClasses: this.calculateAverageGaps(finalSchedule)
      }
    }
  }

  private tournamentSelection(fitnessScores: number[]): ScheduleSession[] {
    const tournamentSize = 3
    let bestIndex = Math.floor(Math.random() * this.population.length)
    let bestScore = fitnessScores[bestIndex]
    
    for (let i = 1; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * this.population.length)
      if (fitnessScores[index] > bestScore) {
        bestIndex = index
        bestScore = fitnessScores[index]
      }
    }
    
    return this.population[bestIndex]
  }

  private crossover(parent1: ScheduleSession[], parent2: ScheduleSession[]): ScheduleSession[] {
    if (Math.random() > this.config.crossoverRate) {
      return [...parent1]
    }
    
    const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.length, parent2.length))
    const offspring = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ]
    
    return offspring
  }

  private mutate(schedule: ScheduleSession[]): ScheduleSession[] {
    return schedule.map(session => {
      if (Math.random() < this.config.mutationRate) {
        // Mutate time slot
        const availableSlots = this.timeSlots.filter(slot => !slot.isBreak)
        const newTimeSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)]
        
        return {
          ...session,
          timeSlot: newTimeSlot
        }
      }
      return session
    })
  }

  private calculateTeacherUtilization(schedule: ScheduleSession[]): number {
    const teacherHours = new Map<string, number>()
    schedule.forEach(session => {
      teacherHours.set(session.teacherId, (teacherHours.get(session.teacherId) || 0) + 1)
    })
    
    const hours = Array.from(teacherHours.values())
    return hours.length > 0 ? hours.reduce((sum, h) => sum + h, 0) / hours.length : 0
  }

  private calculateRoomUtilization(schedule: ScheduleSession[]): number {
    const roomHours = new Map<string, number>()
    schedule.forEach(session => {
      roomHours.set(session.roomId, (roomHours.get(session.roomId) || 0) + 1)
    })
    
    const hours = Array.from(roomHours.values())
    return hours.length > 0 ? hours.reduce((sum, h) => sum + h, 0) / hours.length : 0
  }

  private calculateTimeDistribution(schedule: ScheduleSession[]): number[] {
    const distribution = new Array(7).fill(0) // 7 days
    schedule.forEach(session => {
      distribution[session.timeSlot.day]++
    })
    return distribution
  }

  private calculateAverageGaps(schedule: ScheduleSession[]): number {
    // Calculate average gaps between classes for each class group
    const classSchedules = new Map<string, ScheduleSession[]>()
    
    schedule.forEach(session => {
      if (!classSchedules.has(session.classGroupId)) {
        classSchedules.set(session.classGroupId, [])
      }
      classSchedules.get(session.classGroupId)!.push(session)
    })
    
    let totalGaps = 0
    let classCount = 0
    
    classSchedules.forEach(classSessions => {
      const dailySchedules = new Map<number, ScheduleSession[]>()
      
      classSessions.forEach(session => {
        if (!dailySchedules.has(session.timeSlot.day)) {
          dailySchedules.set(session.timeSlot.day, [])
        }
        dailySchedules.get(session.timeSlot.day)!.push(session)
      })
      
      dailySchedules.forEach(daySessions => {
        daySessions.sort((a, b) => a.timeSlot.period - b.timeSlot.period)
        
        for (let i = 1; i < daySessions.length; i++) {
          const gap = daySessions[i].timeSlot.period - daySessions[i-1].timeSlot.period - 1
          totalGaps += Math.max(0, gap)
        }
      })
      
      classCount++
    })
    
    return classCount > 0 ? totalGaps / classCount : 0
  }
}

export function generateAdvancedTimetable(data: TimetableGenerationData, config?: Partial<AdvancedOptimizationConfig>): OptimizationResult {
  const optimizer = new AdvancedTimetableOptimizer(data, config)
  const result = optimizer.optimize()

  // Apply advanced conflict resolution if conflicts are detected
  if (result.conflicts.length > 0) {
    const resolutionContext = createResolutionContext(data)
    const conflictResolver = createAdvancedConflictResolver(resolutionContext)

    console.log(`Applying advanced conflict resolution to ${result.conflicts.length} conflicts...`)
    const resolutions = conflictResolver.resolveConflicts(result.conflicts, result.schedule)

    // Update the result with resolved conflicts
    const resolvedConflicts: ConflictInfo[] = []
    const unresolvedConflicts: ConflictInfo[] = []

    result.conflicts.forEach(conflict => {
      const resolution = resolutions.get(conflict.description)
      if (resolution?.success) {
        resolvedConflicts.push({
          ...conflict,
          resolved: true,
          resolutionMethod: resolution.explanation
        })
      } else {
        unresolvedConflicts.push(conflict)
      }
    })

    // Calculate new optimization score after conflict resolution
    const resolutionImpact = resolvedConflicts.length * 5 // Bonus for resolved conflicts
    const newScore = Math.min(100, result.optimizationScore + resolutionImpact)

    return {
      ...result,
      conflicts: unresolvedConflicts,
      resolvedConflicts,
      optimizationScore: newScore,
      resolutionSummary: {
        totalConflicts: result.conflicts.length,
        resolvedConflicts: resolvedConflicts.length,
        resolutionRate: (resolvedConflicts.length / result.conflicts.length) * 100,
        resolutionMethods: Array.from(resolutions.values())
          .filter(r => r.success)
          .map(r => r.explanation)
      }
    }
  }

  return result
}

function createResolutionContext(data: TimetableGenerationData): ResolutionContext {
  // Create teacher preferences from the data
  const teacherPreferences = new Map<string, TeacherPreference>()
  data.teachers?.forEach(teacher => {
    teacherPreferences.set(teacher.id, {
      teacherId: teacher.id,
      preferredTimeSlots: teacher.preferences?.preferredTimeSlots || [],
      unavailableSlots: teacher.preferences?.unavailableSlots || [],
      maxConsecutiveHours: teacher.preferences?.maxConsecutiveHours || 4,
      maxDailyHours: teacher.preferences?.maxDailyHours || 8,
      preferredRooms: teacher.preferences?.preferredRooms || [],
      specializations: teacher.subjects || []
    })
  })

  // Create subject requirements
  const subjectRequirements = new Map<string, SubjectRequirement>()
  data.subjects?.forEach(subject => {
    subjectRequirements.set(subject.id, {
      subjectId: subject.id,
      requiredRoomType: subject.type === 'lab' ? 'laboratory' : 'classroom',
      minCapacity: subject.minCapacity || 30,
      requiredEquipment: subject.requiredEquipment || [],
      canBeScheduledOnline: subject.canBeOnline || false,
      preferredTimeSlots: subject.preferredTimeSlots || []
    })
  })

  // Create room capacities
  const roomCapacities = new Map<string, number>()
  data.rooms?.forEach(room => {
    roomCapacities.set(room.id, room.capacity)
  })

  // Create available time slots
  const availableTimeSlots: TimeSlot[] = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const periods = [
    { period: 1, startTime: '09:00', endTime: '10:00' },
    { period: 2, startTime: '10:00', endTime: '11:00' },
    { period: 3, startTime: '11:00', endTime: '12:00' },
    { period: 4, startTime: '12:00', endTime: '13:00' },
    { period: 5, startTime: '14:00', endTime: '15:00' },
    { period: 6, startTime: '15:00', endTime: '16:00' },
    { period: 7, startTime: '16:00', endTime: '17:00' }
  ]

  days.forEach((day, dayIndex) => {
    periods.forEach(periodInfo => {
      availableTimeSlots.push({
        day: dayIndex,
        period: periodInfo.period,
        startTime: periodInfo.startTime,
        endTime: periodInfo.endTime
      })
    })
  })

  // Create institution constraints
  const institutionConstraints: InstitutionConstraints = {
    maxConsecutiveHours: data.preferences?.maxConsecutiveHours || 4,
    mandatoryBreaks: ['13:00-14:00'],
    noClassDays: data.preferences?.noClassDays || [],
    prioritySubjects: data.preferences?.prioritySubjects || [],
    roomBookingRules: data.rooms?.map(room => ({
      roomId: room.id,
      restrictions: room.restrictions || [],
      maintenanceSlots: room.maintenanceSlots || [],
      reservedFor: room.reservedFor || []
    })) || []
  }

  return {
    availableTimeSlots,
    teacherPreferences,
    roomCapacities,
    subjectRequirements,
    classSchedules: new Map(),
    institutionConstraints
  }
}
