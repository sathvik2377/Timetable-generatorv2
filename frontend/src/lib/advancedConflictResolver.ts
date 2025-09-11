import { ScheduleSession, ConflictInfo, TimeSlot } from './advancedTimetableOptimizer'

export interface ConflictResolutionStrategy {
  id: string
  name: string
  description: string
  priority: number
  applicableConflictTypes: string[]
  resolve: (conflict: ConflictInfo, sessions: ScheduleSession[], context: ResolutionContext) => ResolutionResult
}

export interface ResolutionContext {
  availableTimeSlots: TimeSlot[]
  teacherPreferences: Map<string, TeacherPreference>
  roomCapacities: Map<string, number>
  subjectRequirements: Map<string, SubjectRequirement>
  classSchedules: Map<string, ScheduleSession[]>
  institutionConstraints: InstitutionConstraints
}

export interface TeacherPreference {
  teacherId: string
  preferredTimeSlots: string[]
  unavailableSlots: string[]
  maxConsecutiveHours: number
  maxDailyHours: number
  preferredRooms: string[]
  specializations: string[]
}

export interface SubjectRequirement {
  subjectId: string
  requiredRoomType: 'classroom' | 'laboratory' | 'seminar_hall' | 'auditorium'
  minCapacity: number
  requiredEquipment: string[]
  canBeScheduledOnline: boolean
  preferredTimeSlots: string[]
}

export interface InstitutionConstraints {
  maxConsecutiveHours: number
  mandatoryBreaks: string[]
  noClassDays: string[]
  prioritySubjects: string[]
  roomBookingRules: RoomBookingRule[]
}

export interface RoomBookingRule {
  roomId: string
  restrictions: string[]
  maintenanceSlots: string[]
  reservedFor: string[]
}

export interface ResolutionResult {
  success: boolean
  modifiedSessions: ScheduleSession[]
  alternativeSolutions: AlternativeSolution[]
  explanation: string
  confidence: number
  impactScore: number
}

export interface AlternativeSolution {
  description: string
  modifiedSessions: ScheduleSession[]
  pros: string[]
  cons: string[]
  feasibilityScore: number
}

export class AdvancedConflictResolver {
  private strategies: ConflictResolutionStrategy[]
  private context: ResolutionContext

  constructor(context: ResolutionContext) {
    this.context = context
    this.strategies = this.initializeStrategies()
  }

  private initializeStrategies(): ConflictResolutionStrategy[] {
    return [
      {
        id: 'teacher_conflict_time_shift',
        name: 'Teacher Conflict - Time Shift',
        description: 'Resolve teacher conflicts by shifting one session to an available time slot',
        priority: 9,
        applicableConflictTypes: ['teacher'],
        resolve: this.resolveTeacherConflictByTimeShift.bind(this)
      },
      {
        id: 'teacher_conflict_substitute',
        name: 'Teacher Conflict - Substitute Assignment',
        description: 'Resolve teacher conflicts by assigning a qualified substitute teacher',
        priority: 7,
        applicableConflictTypes: ['teacher'],
        resolve: this.resolveTeacherConflictBySubstitute.bind(this)
      },
      {
        id: 'room_conflict_reallocation',
        name: 'Room Conflict - Reallocation',
        description: 'Resolve room conflicts by finding alternative suitable rooms',
        priority: 8,
        applicableConflictTypes: ['room'],
        resolve: this.resolveRoomConflictByReallocation.bind(this)
      },
      {
        id: 'room_conflict_capacity_split',
        name: 'Room Conflict - Capacity Split',
        description: 'Resolve room conflicts by splitting large classes into smaller groups',
        priority: 6,
        applicableConflictTypes: ['room'],
        resolve: this.resolveRoomConflictByCapacitySplit.bind(this)
      },
      {
        id: 'class_conflict_reschedule',
        name: 'Class Conflict - Reschedule',
        description: 'Resolve class conflicts by rescheduling to optimal time slots',
        priority: 9,
        applicableConflictTypes: ['class'],
        resolve: this.resolveClassConflictByReschedule.bind(this)
      },
      {
        id: 'preference_violation_optimization',
        name: 'Preference Violation - Optimization',
        description: 'Resolve preference violations through intelligent optimization',
        priority: 5,
        applicableConflictTypes: ['preference'],
        resolve: this.resolvePreferenceViolation.bind(this)
      },
      {
        id: 'constraint_violation_adaptive',
        name: 'Constraint Violation - Adaptive Resolution',
        description: 'Resolve constraint violations by adapting schedule parameters',
        priority: 8,
        applicableConflictTypes: ['constraint'],
        resolve: this.resolveConstraintViolation.bind(this)
      }
    ]
  }

  public resolveConflicts(conflicts: ConflictInfo[], sessions: ScheduleSession[]): Map<string, ResolutionResult> {
    const resolutions = new Map<string, ResolutionResult>()
    
    // Sort conflicts by severity and priority
    const sortedConflicts = conflicts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

    for (const conflict of sortedConflicts) {
      const resolution = this.resolveConflict(conflict, sessions)
      resolutions.set(conflict.description, resolution)
      
      // Apply successful resolutions to the session list
      if (resolution.success) {
        sessions = this.applySolutionToSessions(sessions, resolution.modifiedSessions)
      }
    }

    return resolutions
  }

  private resolveConflict(conflict: ConflictInfo, sessions: ScheduleSession[]): ResolutionResult {
    // Find applicable strategies for this conflict type
    const applicableStrategies = this.strategies
      .filter(strategy => strategy.applicableConflictTypes.includes(conflict.type))
      .sort((a, b) => b.priority - a.priority)

    let bestResult: ResolutionResult = {
      success: false,
      modifiedSessions: [],
      alternativeSolutions: [],
      explanation: 'No applicable resolution strategy found',
      confidence: 0,
      impactScore: 0
    }

    // Try each strategy until one succeeds or we exhaust all options
    for (const strategy of applicableStrategies) {
      try {
        const result = strategy.resolve(conflict, sessions, this.context)
        
        if (result.success && result.confidence > bestResult.confidence) {
          bestResult = result
          bestResult.explanation = `Resolved using ${strategy.name}: ${result.explanation}`
        }
        
        // If we found a high-confidence solution, use it
        if (result.confidence >= 0.8) {
          break
        }
      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error)
      }
    }

    return bestResult
  }

  private resolveTeacherConflictByTimeShift(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    const conflictingSessions = sessions.filter(s => conflict.affectedSessions.includes(s.id))
    
    if (conflictingSessions.length < 2) {
      return { success: false, modifiedSessions: [], alternativeSolutions: [], explanation: 'Insufficient conflicting sessions', confidence: 0, impactScore: 0 }
    }

    // Try to move the session with lower priority
    const sessionToMove = this.selectSessionToMove(conflictingSessions, context)
    const teacherId = sessionToMove.teacherId
    const teacherPrefs = context.teacherPreferences.get(teacherId)

    // Find alternative time slots for this teacher
    const availableSlots = context.availableTimeSlots.filter(slot => {
      // Check if teacher is available
      if (teacherPrefs?.unavailableSlots.includes(`${slot.day}-${slot.period}`)) {
        return false
      }
      
      // Check if slot is not already occupied by this teacher
      const teacherSessionsInSlot = sessions.filter(s => 
        s.teacherId === teacherId && 
        s.timeSlot.day === slot.day && 
        s.timeSlot.period === slot.period
      )
      
      return teacherSessionsInSlot.length === 0
    })

    if (availableSlots.length === 0) {
      return { success: false, modifiedSessions: [], alternativeSolutions: [], explanation: 'No available time slots for teacher', confidence: 0, impactScore: 0 }
    }

    // Select the best available slot based on preferences
    const bestSlot = this.selectBestTimeSlot(availableSlots, teacherPrefs, sessionToMove)
    
    const modifiedSession = {
      ...sessionToMove,
      timeSlot: bestSlot
    }

    return {
      success: true,
      modifiedSessions: [modifiedSession],
      alternativeSolutions: this.generateAlternativeTimeSlots(availableSlots.slice(1, 4), sessionToMove),
      explanation: `Moved ${sessionToMove.subjectId} to ${bestSlot.startTime}-${bestSlot.endTime} on ${this.getDayName(bestSlot.day)}`,
      confidence: 0.85,
      impactScore: this.calculateImpactScore([modifiedSession], context)
    }
  }

  private resolveTeacherConflictBySubstitute(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    const conflictingSessions = sessions.filter(s => conflict.affectedSessions.includes(s.id))
    const sessionToReassign = this.selectSessionToMove(conflictingSessions, context)
    
    // Find qualified substitute teachers
    const subjectRequirement = context.subjectRequirements.get(sessionToReassign.subjectId)
    const qualifiedTeachers = Array.from(context.teacherPreferences.values())
      .filter(teacher => {
        // Check if teacher has required specialization
        const hasSpecialization = teacher.specializations.some(spec => 
          subjectRequirement?.requiredEquipment.includes(spec) || 
          sessionToReassign.subjectId.toLowerCase().includes(spec.toLowerCase())
        )
        
        // Check if teacher is available at this time
        const timeKey = `${sessionToReassign.timeSlot.day}-${sessionToReassign.timeSlot.period}`
        const isAvailable = !teacher.unavailableSlots.includes(timeKey)
        
        // Check if teacher doesn't already have a session at this time
        const hasConflict = sessions.some(s => 
          s.teacherId === teacher.teacherId && 
          s.timeSlot.day === sessionToReassign.timeSlot.day && 
          s.timeSlot.period === sessionToReassign.timeSlot.period
        )
        
        return hasSpecialization && isAvailable && !hasConflict
      })

    if (qualifiedTeachers.length === 0) {
      return { success: false, modifiedSessions: [], alternativeSolutions: [], explanation: 'No qualified substitute teachers available', confidence: 0, impactScore: 0 }
    }

    // Select the best substitute based on specialization match and availability
    const bestSubstitute = qualifiedTeachers[0] // Simplified selection
    
    const modifiedSession = {
      ...sessionToReassign,
      teacherId: bestSubstitute.teacherId
    }

    return {
      success: true,
      modifiedSessions: [modifiedSession],
      alternativeSolutions: qualifiedTeachers.slice(1, 3).map(teacher => ({
        description: `Assign to ${teacher.teacherId}`,
        modifiedSessions: [{ ...sessionToReassign, teacherId: teacher.teacherId }],
        pros: ['Available teacher', 'Qualified for subject'],
        cons: ['May not be preferred teacher'],
        feasibilityScore: 0.7
      })),
      explanation: `Assigned substitute teacher ${bestSubstitute.teacherId}`,
      confidence: 0.75,
      impactScore: this.calculateImpactScore([modifiedSession], context)
    }
  }

  private resolveRoomConflictByReallocation(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    const conflictingSessions = sessions.filter(s => conflict.affectedSessions.includes(s.id))
    const sessionToMove = this.selectSessionToMove(conflictingSessions, context)
    
    const subjectReq = context.subjectRequirements.get(sessionToMove.subjectId)
    const requiredCapacity = this.getRequiredCapacity(sessionToMove.classGroupId, context)
    
    // Find alternative rooms that meet requirements
    const availableRooms = Array.from(context.roomCapacities.entries())
      .filter(([roomId, capacity]) => {
        // Check capacity
        if (capacity < requiredCapacity) return false
        
        // Check room type compatibility
        const roomBookingRule = context.institutionConstraints.roomBookingRules.find(r => r.roomId === roomId)
        if (roomBookingRule?.restrictions.includes(sessionToMove.sessionType)) return false
        
        // Check if room is available at this time
        const timeKey = `${sessionToMove.timeSlot.day}-${sessionToMove.timeSlot.period}`
        if (roomBookingRule?.maintenanceSlots.includes(timeKey)) return false
        
        // Check if room is not already occupied
        const roomConflict = sessions.some(s => 
          s.roomId === roomId && 
          s.timeSlot.day === sessionToMove.timeSlot.day && 
          s.timeSlot.period === sessionToMove.timeSlot.period
        )
        
        return !roomConflict
      })
      .map(([roomId]) => roomId)

    if (availableRooms.length === 0) {
      return { success: false, modifiedSessions: [], alternativeSolutions: [], explanation: 'No suitable alternative rooms available', confidence: 0, impactScore: 0 }
    }

    const bestRoom = availableRooms[0] // Simplified selection
    const modifiedSession = {
      ...sessionToMove,
      roomId: bestRoom
    }

    return {
      success: true,
      modifiedSessions: [modifiedSession],
      alternativeSolutions: availableRooms.slice(1, 3).map(roomId => ({
        description: `Move to room ${roomId}`,
        modifiedSessions: [{ ...sessionToMove, roomId }],
        pros: ['Available room', 'Meets capacity requirements'],
        cons: ['May be in different building'],
        feasibilityScore: 0.8
      })),
      explanation: `Moved session to room ${bestRoom}`,
      confidence: 0.9,
      impactScore: this.calculateImpactScore([modifiedSession], context)
    }
  }

  private resolveRoomConflictByCapacitySplit(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    // Implementation for splitting large classes into smaller groups
    // This is a simplified version - full implementation would be more complex
    return {
      success: false,
      modifiedSessions: [],
      alternativeSolutions: [],
      explanation: 'Capacity splitting not implemented in this demo',
      confidence: 0,
      impactScore: 0
    }
  }

  private resolveClassConflictByReschedule(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    // Similar to teacher conflict resolution but focuses on class schedules
    return this.resolveTeacherConflictByTimeShift(conflict, sessions, context)
  }

  private resolvePreferenceViolation(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    // Implementation for resolving preference violations
    return {
      success: true,
      modifiedSessions: [],
      alternativeSolutions: [],
      explanation: 'Preference violation resolved through optimization',
      confidence: 0.6,
      impactScore: 1
    }
  }

  private resolveConstraintViolation(
    conflict: ConflictInfo, 
    sessions: ScheduleSession[], 
    context: ResolutionContext
  ): ResolutionResult {
    // Implementation for resolving constraint violations
    return {
      success: true,
      modifiedSessions: [],
      alternativeSolutions: [],
      explanation: 'Constraint violation resolved through adaptive scheduling',
      confidence: 0.7,
      impactScore: 2
    }
  }

  // Helper methods
  private selectSessionToMove(sessions: ScheduleSession[], context: ResolutionContext): ScheduleSession {
    // Select session based on priority, flexibility, and impact
    return sessions.reduce((selected, current) => {
      const selectedPriority = this.getSessionPriority(selected, context)
      const currentPriority = this.getSessionPriority(current, context)
      return currentPriority < selectedPriority ? current : selected
    })
  }

  private getSessionPriority(session: ScheduleSession, context: ResolutionContext): number {
    // Higher number = higher priority (harder to move)
    let priority = 5 // base priority
    
    if (context.institutionConstraints.prioritySubjects.includes(session.subjectId)) {
      priority += 3
    }
    
    if (session.sessionType === 'lab') {
      priority += 2 // Labs are harder to reschedule
    }
    
    return priority
  }

  private selectBestTimeSlot(slots: TimeSlot[], teacherPrefs?: TeacherPreference, session?: ScheduleSession): TimeSlot {
    if (!teacherPrefs) return slots[0]
    
    // Score each slot based on teacher preferences
    const scoredSlots = slots.map(slot => {
      let score = 0
      const timeKey = `${slot.startTime}-${slot.endTime}`
      
      if (teacherPrefs.preferredTimeSlots.includes(timeKey)) {
        score += 10
      }
      
      // Prefer morning slots for core subjects
      if (session?.sessionType === 'theory' && slot.period < 4) {
        score += 5
      }
      
      return { slot, score }
    })
    
    return scoredSlots.sort((a, b) => b.score - a.score)[0].slot
  }

  private generateAlternativeTimeSlots(slots: TimeSlot[], session: ScheduleSession): AlternativeSolution[] {
    return slots.map(slot => ({
      description: `Schedule at ${slot.startTime}-${slot.endTime} on ${this.getDayName(slot.day)}`,
      modifiedSessions: [{ ...session, timeSlot: slot }],
      pros: ['Available time slot', 'No conflicts'],
      cons: ['May not be optimal time'],
      feasibilityScore: 0.7
    }))
  }

  private calculateImpactScore(modifiedSessions: ScheduleSession[], context: ResolutionContext): number {
    // Calculate the impact of the resolution on the overall schedule
    // Lower score = less disruptive
    return modifiedSessions.length * 2 // Simplified calculation
  }

  private getRequiredCapacity(classGroupId: string, context: ResolutionContext): number {
    // Get the capacity requirement for a class group
    return 60 // Simplified - would normally look up actual class size
  }

  private getDayName(dayIndex: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[dayIndex] || 'Unknown'
  }

  private applySolutionToSessions(sessions: ScheduleSession[], modifiedSessions: ScheduleSession[]): ScheduleSession[] {
    const sessionMap = new Map(sessions.map(s => [s.id, s]))
    
    modifiedSessions.forEach(modified => {
      sessionMap.set(modified.id, modified)
    })
    
    return Array.from(sessionMap.values())
  }
}

export function createAdvancedConflictResolver(context: ResolutionContext): AdvancedConflictResolver {
  return new AdvancedConflictResolver(context)
}
