export interface UndoRedoState<T> {
  data: T
  timestamp: number
  description: string
}

export class UndoRedoManager<T> {
  private history: UndoRedoState<T>[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50

  constructor(initialState?: T, description: string = 'Initial state') {
    if (initialState) {
      this.saveState(initialState, description)
    }
  }

  saveState(data: T, description: string): void {
    // Remove any states after current index (when user made changes after undo)
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // Add new state
    const newState: UndoRedoState<T> = {
      data: this.deepClone(data),
      timestamp: Date.now(),
      description
    }
    
    this.history.push(newState)
    this.currentIndex = this.history.length - 1
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }
  }

  undo(): T | null {
    if (!this.canUndo()) {
      return null
    }
    
    this.currentIndex--
    return this.deepClone(this.history[this.currentIndex].data)
  }

  redo(): T | null {
    if (!this.canRedo()) {
      return null
    }
    
    this.currentIndex++
    return this.deepClone(this.history[this.currentIndex].data)
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getCurrentState(): T | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.deepClone(this.history[this.currentIndex].data)
    }
    return null
  }

  getHistory(): UndoRedoState<T>[] {
    return this.history.map(state => ({
      ...state,
      data: this.deepClone(state.data)
    }))
  }

  getCurrentDescription(): string {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].description
    }
    return ''
  }

  getUndoDescription(): string {
    if (this.canUndo()) {
      return this.history[this.currentIndex - 1].description
    }
    return ''
  }

  getRedoDescription(): string {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1].description
    }
    return ''
  }

  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  private deepClone(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }
    
    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }
    
    return obj
  }
}

// Timetable-specific undo/redo manager
export interface TimetableSession {
  subject: string
  teacher: string
  room: string
  branch: string
  section: string
  type: 'theory' | 'practical' | 'tutorial'
  students: number
}

export interface TimetableSchedule {
  [day: string]: {
    [time: string]: TimetableSession[]
  }
}

export class TimetableUndoRedoManager extends UndoRedoManager<TimetableSchedule> {
  constructor(initialSchedule?: TimetableSchedule) {
    super(initialSchedule, 'Initial timetable')
  }

  moveSession(
    fromDay: string,
    fromTime: string,
    toDay: string,
    toTime: string,
    sessionIndex: number,
    currentSchedule: TimetableSchedule
  ): TimetableSchedule {
    const newSchedule = this.deepClone(currentSchedule)
    
    // Get the session to move
    const session = newSchedule[fromDay]?.[fromTime]?.[sessionIndex]
    if (!session) {
      return currentSchedule
    }
    
    // Remove from original position
    newSchedule[fromDay][fromTime].splice(sessionIndex, 1)
    
    // Clean up empty time slots
    if (newSchedule[fromDay][fromTime].length === 0) {
      delete newSchedule[fromDay][fromTime]
    }
    
    // Add to new position
    if (!newSchedule[toDay]) {
      newSchedule[toDay] = {}
    }
    if (!newSchedule[toDay][toTime]) {
      newSchedule[toDay][toTime] = []
    }
    newSchedule[toDay][toTime].push(session)
    
    // Save state
    this.saveState(
      newSchedule,
      `Moved ${session.subject} from ${fromDay} ${fromTime} to ${toDay} ${toTime}`
    )
    
    return newSchedule
  }

  addSession(
    day: string,
    time: string,
    session: TimetableSession,
    currentSchedule: TimetableSchedule
  ): TimetableSchedule {
    const newSchedule = this.deepClone(currentSchedule)
    
    if (!newSchedule[day]) {
      newSchedule[day] = {}
    }
    if (!newSchedule[day][time]) {
      newSchedule[day][time] = []
    }
    
    newSchedule[day][time].push(session)
    
    this.saveState(
      newSchedule,
      `Added ${session.subject} to ${day} ${time}`
    )
    
    return newSchedule
  }

  removeSession(
    day: string,
    time: string,
    sessionIndex: number,
    currentSchedule: TimetableSchedule
  ): TimetableSchedule {
    const newSchedule = this.deepClone(currentSchedule)
    
    const session = newSchedule[day]?.[time]?.[sessionIndex]
    if (!session) {
      return currentSchedule
    }
    
    newSchedule[day][time].splice(sessionIndex, 1)
    
    // Clean up empty time slots
    if (newSchedule[day][time].length === 0) {
      delete newSchedule[day][time]
    }
    
    this.saveState(
      newSchedule,
      `Removed ${session.subject} from ${day} ${time}`
    )
    
    return newSchedule
  }

  updateSession(
    day: string,
    time: string,
    sessionIndex: number,
    updatedSession: Partial<TimetableSession>,
    currentSchedule: TimetableSchedule
  ): TimetableSchedule {
    const newSchedule = this.deepClone(currentSchedule)
    
    if (!newSchedule[day]?.[time]?.[sessionIndex]) {
      return currentSchedule
    }
    
    const originalSession = newSchedule[day][time][sessionIndex]
    newSchedule[day][time][sessionIndex] = {
      ...originalSession,
      ...updatedSession
    }
    
    this.saveState(
      newSchedule,
      `Updated ${originalSession.subject} in ${day} ${time}`
    )
    
    return newSchedule
  }

  private deepClone<U>(obj: U): U {
    return super['deepClone'](obj)
  }
}
