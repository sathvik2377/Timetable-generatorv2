import { TimetableGenerationData } from './templateManager'

export interface Suggestion {
  id: string
  type: 'optimization' | 'conflict' | 'improvement' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  action?: () => void
}

export class SmartSuggestionsEngine {
  generateSuggestions(data: TimetableGenerationData): Suggestion[] {
    const suggestions: Suggestion[] = []

    // Analyze branches
    this.analyzeBranches(data, suggestions)
    
    // Analyze teachers
    this.analyzeTeachers(data, suggestions)
    
    // Analyze subjects
    this.analyzeSubjects(data, suggestions)
    
    // Analyze rooms
    this.analyzeRooms(data, suggestions)
    
    // Analyze preferences
    this.analyzePreferences(data, suggestions)

    return suggestions.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  private analyzeBranches(data: TimetableGenerationData, suggestions: Suggestion[]) {
    if (data.branches.length === 0) {
      suggestions.push({
        id: 'no-branches',
        type: 'warning',
        title: 'No Branches Defined',
        description: 'Add at least one academic branch to generate timetables.',
        impact: 'high',
        actionable: true
      })
      return
    }

    // Check for unbalanced sections
    const avgSections = data.branches.reduce((sum, b) => sum + b.sections, 0) / data.branches.length
    const imbalanced = data.branches.filter(b => Math.abs(b.sections - avgSections) > 2)
    
    if (imbalanced.length > 0) {
      suggestions.push({
        id: 'unbalanced-sections',
        type: 'improvement',
        title: 'Unbalanced Section Distribution',
        description: `Some branches have significantly different section counts. Consider balancing for better resource utilization.`,
        impact: 'medium',
        actionable: true
      })
    }

    // Check for large class sizes
    const largeBranches = data.branches.filter(b => b.totalStudents / b.sections > 50)
    if (largeBranches.length > 0) {
      suggestions.push({
        id: 'large-classes',
        type: 'warning',
        title: 'Large Class Sizes Detected',
        description: `${largeBranches.length} branches have sections with >50 students. Consider adding more sections.`,
        impact: 'medium',
        actionable: true
      })
    }
  }

  private analyzeTeachers(data: TimetableGenerationData, suggestions: Suggestion[]) {
    if (data.teachers.length === 0) {
      suggestions.push({
        id: 'no-teachers',
        type: 'warning',
        title: 'No Teachers Defined',
        description: 'Add faculty members to assign subjects properly.',
        impact: 'high',
        actionable: true
      })
      return
    }

    // Check teacher-to-student ratio
    const totalStudents = data.branches.reduce((sum, b) => sum + b.totalStudents, 0)
    const ratio = totalStudents / data.teachers.length
    
    if (ratio > 30) {
      suggestions.push({
        id: 'high-teacher-ratio',
        type: 'warning',
        title: 'High Student-Teacher Ratio',
        description: `Current ratio is ${Math.round(ratio)}:1. Consider adding more teachers for better education quality.`,
        impact: 'medium',
        actionable: true
      })
    }

    // Check for teachers with too many subjects
    const overloadedTeachers = data.teachers.filter(t => t.subjects.length > 4)
    if (overloadedTeachers.length > 0) {
      suggestions.push({
        id: 'overloaded-teachers',
        type: 'improvement',
        title: 'Teachers with Many Subjects',
        description: `${overloadedTeachers.length} teachers are assigned >4 subjects. Consider specialization.`,
        impact: 'low',
        actionable: true
      })
    }

    // Check for teachers with excessive daily hours
    const overworkedTeachers = data.teachers.filter(t => t.maxHoursPerDay > 6)
    if (overworkedTeachers.length > 0) {
      suggestions.push({
        id: 'overworked-teachers',
        type: 'warning',
        title: 'Excessive Teaching Hours',
        description: `${overworkedTeachers.length} teachers have >6 hours/day. Consider reducing workload.`,
        impact: 'medium',
        actionable: true
      })
    }
  }

  private analyzeSubjects(data: TimetableGenerationData, suggestions: Suggestion[]) {
    if (data.subjects.length === 0) {
      suggestions.push({
        id: 'no-subjects',
        type: 'warning',
        title: 'No Subjects Defined',
        description: 'Add subjects for each branch to create meaningful timetables.',
        impact: 'high',
        actionable: true
      })
      return
    }

    // Check for subjects without teachers
    const subjectNames = data.subjects.map(s => s.name.toLowerCase())
    const teacherSubjects = data.teachers.flatMap(t => t.subjects.map(s => s.toLowerCase()))
    const unassignedSubjects = subjectNames.filter(s => 
      !teacherSubjects.some(ts => ts.includes(s) || s.includes(ts))
    )

    if (unassignedSubjects.length > 0) {
      suggestions.push({
        id: 'unassigned-subjects',
        type: 'conflict',
        title: 'Subjects Without Teachers',
        description: `${unassignedSubjects.length} subjects may not have qualified teachers assigned.`,
        impact: 'high',
        actionable: true
      })
    }

    // Check credit distribution
    const avgCredits = data.subjects.reduce((sum, s) => sum + s.credits, 0) / data.subjects.length
    const imbalancedSubjects = data.subjects.filter(s => Math.abs(s.credits - avgCredits) > 2)
    
    if (imbalancedSubjects.length > data.subjects.length * 0.3) {
      suggestions.push({
        id: 'imbalanced-credits',
        type: 'improvement',
        title: 'Uneven Credit Distribution',
        description: 'Consider balancing credit hours across subjects for better workload distribution.',
        impact: 'low',
        actionable: true
      })
    }

    // Check for too many practical subjects
    const practicalCount = data.subjects.filter(s => s.type === 'practical').length
    const totalCount = data.subjects.length
    
    if (practicalCount / totalCount > 0.6) {
      suggestions.push({
        id: 'too-many-practicals',
        type: 'warning',
        title: 'High Practical Subject Ratio',
        description: 'Many practical subjects may strain lab resources. Ensure adequate facilities.',
        impact: 'medium',
        actionable: true
      })
    }
  }

  private analyzeRooms(data: TimetableGenerationData, suggestions: Suggestion[]) {
    if (data.rooms.length === 0) {
      suggestions.push({
        id: 'no-rooms',
        type: 'warning',
        title: 'No Rooms Defined',
        description: 'Add classrooms and labs for proper space allocation.',
        impact: 'high',
        actionable: true
      })
      return
    }

    // Check room capacity vs student count
    const totalStudents = data.branches.reduce((sum, b) => sum + b.totalStudents, 0)
    const totalCapacity = data.rooms.reduce((sum, r) => sum + r.capacity, 0)
    
    if (totalCapacity < totalStudents * 1.2) {
      suggestions.push({
        id: 'insufficient-capacity',
        type: 'warning',
        title: 'Insufficient Room Capacity',
        description: 'Total room capacity may be inadequate for all students. Consider adding more rooms.',
        impact: 'high',
        actionable: true
      })
    }

    // Check lab availability for practical subjects
    const practicalSubjects = data.subjects.filter(s => s.type === 'practical').length
    const labs = data.rooms.filter(r => r.type === 'lab').length
    
    if (practicalSubjects > 0 && labs === 0) {
      suggestions.push({
        id: 'no-labs',
        type: 'conflict',
        title: 'No Labs for Practical Subjects',
        description: 'Practical subjects require laboratory facilities. Add lab rooms.',
        impact: 'high',
        actionable: true
      })
    } else if (practicalSubjects > labs * 2) {
      suggestions.push({
        id: 'insufficient-labs',
        type: 'warning',
        title: 'Limited Lab Availability',
        description: 'Consider adding more labs to avoid scheduling conflicts for practical subjects.',
        impact: 'medium',
        actionable: true
      })
    }

    // Check for rooms without equipment
    const emptyRooms = data.rooms.filter(r => !r.equipment || r.equipment.length === 0)
    if (emptyRooms.length > 0) {
      suggestions.push({
        id: 'rooms-without-equipment',
        type: 'improvement',
        title: 'Rooms Without Equipment Listed',
        description: `${emptyRooms.length} rooms have no equipment specified. Add equipment details for better allocation.`,
        impact: 'low',
        actionable: true
      })
    }
  }

  private analyzePreferences(data: TimetableGenerationData, suggestions: Suggestion[]) {
    const prefs = data.preferences

    // Check working hours
    const startHour = parseInt(prefs.startTime.split(':')[0])
    const endHour = parseInt(prefs.endTime.split(':')[0])
    const totalHours = endHour - startHour

    if (totalHours > 10) {
      suggestions.push({
        id: 'long-day',
        type: 'warning',
        title: 'Very Long Academic Day',
        description: 'Consider reducing daily hours to prevent student and teacher fatigue.',
        impact: 'medium',
        actionable: true
      })
    }

    if (totalHours < 6) {
      suggestions.push({
        id: 'short-day',
        type: 'improvement',
        title: 'Short Academic Day',
        description: 'Consider extending hours to accommodate more subjects effectively.',
        impact: 'low',
        actionable: true
      })
    }

    // Check lunch break timing
    const lunchStart = prefs.lunchBreak.split('-')[0]
    const lunchHour = parseInt(lunchStart.split(':')[0])
    
    if (lunchHour < 12 || lunchHour > 14) {
      suggestions.push({
        id: 'unusual-lunch-time',
        type: 'improvement',
        title: 'Unusual Lunch Break Timing',
        description: 'Consider scheduling lunch between 12:00-14:00 for better student comfort.',
        impact: 'low',
        actionable: true
      })
    }

    // Check period duration
    if (prefs.periodDuration < 45) {
      suggestions.push({
        id: 'short-periods',
        type: 'improvement',
        title: 'Short Period Duration',
        description: 'Consider 45-60 minute periods for effective learning.',
        impact: 'medium',
        actionable: true
      })
    }

    if (prefs.periodDuration > 90) {
      suggestions.push({
        id: 'long-periods',
        type: 'warning',
        title: 'Very Long Periods',
        description: 'Periods >90 minutes may reduce student attention. Consider shorter durations.',
        impact: 'medium',
        actionable: true
      })
    }

    // Check working days
    if (prefs.workingDays.length < 5) {
      suggestions.push({
        id: 'few-working-days',
        type: 'warning',
        title: 'Limited Working Days',
        description: 'Consider adding more working days to distribute subjects effectively.',
        impact: 'medium',
        actionable: true
      })
    }
  }
}

export const smartSuggestionsEngine = new SmartSuggestionsEngine()
