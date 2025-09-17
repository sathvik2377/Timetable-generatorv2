export interface RealisticDemoData {
  institution: {
    name: string
    type: 'school' | 'college' | 'university'
    address: string
    phone: string
    email: string
    academicYear: string
    currentSemester: number
  }
  branches: Array<{
    id: string
    name: string
    code: string
    description: string
    totalStudents: number
    sections: number
    yearLevels: number[]
    headOfDepartment: string
  }>
  subjects: Array<{
    id: string
    name: string
    code: string
    branchId: string
    type: 'core' | 'elective' | 'lab' | 'skill' | 'project'
    credits: number
    theoryHours: number
    practicalHours: number
    semester: number
    year: number
    prerequisites?: string[]
  }>
  teachers: Array<{
    id: string
    name: string
    email: string
    employeeId: string
    designation: string
    qualification: string
    specialization: string[]
    experience: number
    maxHoursPerWeek: number
    preferredTimeSlots: string[]
    unavailableSlots: string[]
    branchAffiliation: string[]
  }>
  rooms: Array<{
    id: string
    name: string
    code: string
    type: 'classroom' | 'laboratory' | 'seminar_hall' | 'auditorium' | 'library'
    capacity: number
    building: string
    floor: number
    facilities: string[]
    availability: string[]
  }>
  classGroups: Array<{
    id: string
    name: string
    branchId: string
    year: number
    section: string
    semester: number
    strength: number
    classRepresentative?: string
  }>
  timetablePreferences: {
    startTime: string
    endTime: string
    lunchBreak: string
    periodDuration: number
    workingDays: string[]
    maxPeriodsPerDay: number
    breakBetweenPeriods: number
  }
}

export function generateRealisticDemoData(): RealisticDemoData {
  // Indian engineering college context
  const branches = [
    {
      id: 'cse',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Comprehensive program covering software development, algorithms, AI, and emerging technologies',
      totalStudents: 240,
      sections: 4,
      yearLevels: [1, 2, 3, 4],
      headOfDepartment: 'Dr. Rajesh Kumar'
    },
    {
      id: 'ece',
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Focus on electronic systems, communication networks, and signal processing',
      totalStudents: 180,
      sections: 3,
      yearLevels: [1, 2, 3, 4],
      headOfDepartment: 'Prof. Priya Sharma'
    },
    {
      id: 'me',
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Traditional engineering discipline covering design, manufacturing, and thermal systems',
      totalStudents: 120,
      sections: 2,
      yearLevels: [1, 2, 3, 4],
      headOfDepartment: 'Dr. Suresh Patel'
    },
    {
      id: 'ce',
      name: 'Civil Engineering',
      code: 'CE',
      description: 'Infrastructure development, construction management, and environmental engineering',
      totalStudents: 90,
      sections: 2,
      yearLevels: [1, 2, 3, 4],
      headOfDepartment: 'Prof. Anita Gupta'
    },
    {
      id: 'it',
      name: 'Information Technology',
      code: 'IT',
      description: 'IT systems, database management, web technologies, and cybersecurity',
      totalStudents: 150,
      sections: 3,
      yearLevels: [1, 2, 3, 4],
      headOfDepartment: 'Dr. Vikram Singh'
    }
  ]

  const subjects = [
    // CSE Subjects - 3rd Year, 5th Semester
    { id: 'cse301', name: 'Data Structures & Algorithms', code: 'CSE301', branchId: 'cse', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'cse302', name: 'Database Management Systems', code: 'CSE302', branchId: 'cse', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'cse303', name: 'Computer Networks', code: 'CSE303', branchId: 'cse', type: 'core' as const, credits: 3, theoryHours: 3, practicalHours: 0, semester: 5, year: 3 },
    { id: 'cse304', name: 'Operating Systems', code: 'CSE304', branchId: 'cse', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'cse305', name: 'Software Engineering', code: 'CSE305', branchId: 'cse', type: 'core' as const, credits: 3, theoryHours: 3, practicalHours: 0, semester: 5, year: 3 },
    { id: 'cse306', name: 'Machine Learning', code: 'CSE306', branchId: 'cse', type: 'elective' as const, credits: 3, theoryHours: 2, practicalHours: 2, semester: 5, year: 3 },
    { id: 'cse307', name: 'Web Development Lab', code: 'CSE307', branchId: 'cse', type: 'lab' as const, credits: 2, theoryHours: 0, practicalHours: 4, semester: 5, year: 3 },
    { id: 'cse308', name: 'Professional Communication', code: 'CSE308', branchId: 'cse', type: 'skill' as const, credits: 2, theoryHours: 2, practicalHours: 0, semester: 5, year: 3 },

    // ECE Subjects - 3rd Year, 5th Semester
    { id: 'ece301', name: 'Digital Signal Processing', code: 'ECE301', branchId: 'ece', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'ece302', name: 'Microprocessors & Microcontrollers', code: 'ECE302', branchId: 'ece', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'ece303', name: 'Communication Systems', code: 'ECE303', branchId: 'ece', type: 'core' as const, credits: 3, theoryHours: 3, practicalHours: 0, semester: 5, year: 3 },
    { id: 'ece304', name: 'VLSI Design', code: 'ECE304', branchId: 'ece', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'ece305', name: 'Antenna & Wave Propagation', code: 'ECE305', branchId: 'ece', type: 'elective' as const, credits: 3, theoryHours: 3, practicalHours: 0, semester: 5, year: 3 },
    { id: 'ece306', name: 'Embedded Systems Lab', code: 'ECE306', branchId: 'ece', type: 'lab' as const, credits: 2, theoryHours: 0, practicalHours: 4, semester: 5, year: 3 },

    // ME Subjects - 3rd Year, 5th Semester
    { id: 'me301', name: 'Heat Transfer', code: 'ME301', branchId: 'me', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'me302', name: 'Machine Design', code: 'ME302', branchId: 'me', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'me303', name: 'Manufacturing Processes', code: 'ME303', branchId: 'me', type: 'core' as const, credits: 3, theoryHours: 3, practicalHours: 0, semester: 5, year: 3 },
    { id: 'me304', name: 'Fluid Mechanics', code: 'ME304', branchId: 'me', type: 'core' as const, credits: 4, theoryHours: 3, practicalHours: 2, semester: 5, year: 3 },
    { id: 'me305', name: 'CAD/CAM Lab', code: 'ME305', branchId: 'me', type: 'lab' as const, credits: 2, theoryHours: 0, practicalHours: 4, semester: 5, year: 3 },

    // Common subjects
    { id: 'com301', name: 'Environmental Science', code: 'EVS301', branchId: 'common', type: 'core' as const, credits: 2, theoryHours: 2, practicalHours: 0, semester: 5, year: 3 },
    { id: 'com302', name: 'Constitution of India', code: 'COI301', branchId: 'common', type: 'skill' as const, credits: 1, theoryHours: 1, practicalHours: 0, semester: 5, year: 3 }
  ]

  const teachers = [
    {
      id: 't001', name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@college.edu', employeeId: 'EMP001',
      designation: 'Professor & HOD', qualification: 'Ph.D. in Computer Science', specialization: ['Data Structures', 'Algorithms', 'Machine Learning'],
      experience: 15, maxHoursPerWeek: 18, preferredTimeSlots: ['09:00-11:00', '14:00-16:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['cse']
    },
    {
      id: 't002', name: 'Prof. Priya Sharma', email: 'priya.sharma@college.edu', employeeId: 'EMP002',
      designation: 'Associate Professor', qualification: 'M.Tech in Electronics', specialization: ['Digital Signal Processing', 'Communication Systems'],
      experience: 12, maxHoursPerWeek: 20, preferredTimeSlots: ['10:00-12:00', '15:00-17:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['ece']
    },
    {
      id: 't003', name: 'Dr. Suresh Patel', email: 'suresh.patel@college.edu', employeeId: 'EMP003',
      designation: 'Professor', qualification: 'Ph.D. in Mechanical Engineering', specialization: ['Heat Transfer', 'Machine Design', 'Manufacturing'],
      experience: 18, maxHoursPerWeek: 16, preferredTimeSlots: ['09:00-11:00', '14:00-16:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['me']
    },
    {
      id: 't004', name: 'Dr. Anita Gupta', email: 'anita.gupta@college.edu', employeeId: 'EMP004',
      designation: 'Assistant Professor', qualification: 'Ph.D. in Database Systems', specialization: ['Database Management', 'Data Mining', 'Big Data'],
      experience: 8, maxHoursPerWeek: 22, preferredTimeSlots: ['10:00-12:00', '15:00-17:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['cse', 'it']
    },
    {
      id: 't005', name: 'Prof. Vikram Singh', email: 'vikram.singh@college.edu', employeeId: 'EMP005',
      designation: 'Associate Professor', qualification: 'M.Tech in Software Engineering', specialization: ['Software Engineering', 'Web Development', 'Mobile Apps'],
      experience: 10, maxHoursPerWeek: 20, preferredTimeSlots: ['09:00-11:00', '14:00-16:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['cse', 'it']
    },
    {
      id: 't006', name: 'Dr. Meera Joshi', email: 'meera.joshi@college.edu', employeeId: 'EMP006',
      designation: 'Assistant Professor', qualification: 'Ph.D. in VLSI Design', specialization: ['VLSI Design', 'Embedded Systems', 'Digital Electronics'],
      experience: 6, maxHoursPerWeek: 24, preferredTimeSlots: ['10:00-12:00', '15:00-17:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['ece']
    },
    {
      id: 't007', name: 'Prof. Amit Verma', email: 'amit.verma@college.edu', employeeId: 'EMP007',
      designation: 'Associate Professor', qualification: 'M.Tech in Computer Networks', specialization: ['Computer Networks', 'Network Security', 'Operating Systems'],
      experience: 11, maxHoursPerWeek: 18, preferredTimeSlots: ['09:00-11:00', '14:00-16:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['cse', 'it']
    },
    {
      id: 't008', name: 'Dr. Kavita Rao', email: 'kavita.rao@college.edu', employeeId: 'EMP008',
      designation: 'Assistant Professor', qualification: 'Ph.D. in Thermal Engineering', specialization: ['Heat Transfer', 'Fluid Mechanics', 'Thermodynamics'],
      experience: 7, maxHoursPerWeek: 22, preferredTimeSlots: ['10:00-12:00', '15:00-17:00'], unavailableSlots: ['13:00-14:00'],
      branchAffiliation: ['me']
    }
  ]

  const rooms = [
    // Classrooms
    { id: 'r001', name: 'Classroom A-101', code: 'A-101', type: 'classroom' as const, capacity: 60, building: 'Academic Block A', floor: 1, facilities: ['Projector', 'Whiteboard', 'AC', 'Audio System'], availability: ['09:00-17:00'] },
    { id: 'r002', name: 'Classroom A-102', code: 'A-102', type: 'classroom' as const, capacity: 60, building: 'Academic Block A', floor: 1, facilities: ['Projector', 'Whiteboard', 'AC'], availability: ['09:00-17:00'] },
    { id: 'r003', name: 'Classroom A-201', code: 'A-201', type: 'classroom' as const, capacity: 80, building: 'Academic Block A', floor: 2, facilities: ['Smart Board', 'AC', 'Audio System'], availability: ['09:00-17:00'] },
    { id: 'r004', name: 'Classroom B-101', code: 'B-101', type: 'classroom' as const, capacity: 50, building: 'Academic Block B', floor: 1, facilities: ['Projector', 'Whiteboard'], availability: ['09:00-17:00'] },
    
    // Laboratories
    { id: 'r005', name: 'Computer Lab 1', code: 'CL-01', type: 'laboratory' as const, capacity: 30, building: 'Computer Center', floor: 1, facilities: ['30 Computers', 'Projector', 'AC', 'Network'], availability: ['09:00-17:00'] },
    { id: 'r006', name: 'Computer Lab 2', code: 'CL-02', type: 'laboratory' as const, capacity: 30, building: 'Computer Center', floor: 1, facilities: ['30 Computers', 'Projector', 'AC', 'Network'], availability: ['09:00-17:00'] },
    { id: 'r007', name: 'Electronics Lab', code: 'EL-01', type: 'laboratory' as const, capacity: 25, building: 'Engineering Block', floor: 2, facilities: ['Oscilloscopes', 'Function Generators', 'Multimeters', 'Power Supplies'], availability: ['09:00-17:00'] },
    { id: 'r008', name: 'Mechanical Workshop', code: 'MW-01', type: 'laboratory' as const, capacity: 20, building: 'Workshop Block', floor: 1, facilities: ['Lathes', 'Milling Machines', 'Welding Equipment', 'Safety Gear'], availability: ['09:00-17:00'] },
    
    // Special rooms
    { id: 'r009', name: 'Seminar Hall', code: 'SH-01', type: 'seminar_hall' as const, capacity: 100, building: 'Administrative Block', floor: 2, facilities: ['Projector', 'Audio System', 'AC', 'Stage'], availability: ['09:00-17:00'] },
    { id: 'r010', name: 'Main Auditorium', code: 'AUD-01', type: 'auditorium' as const, capacity: 300, building: 'Auditorium Block', floor: 1, facilities: ['Stage', 'Sound System', 'Lighting', 'AC'], availability: ['09:00-17:00'] }
  ]

  const classGroups = [
    // CSE Classes
    { id: 'cse3a', name: 'CSE-3A', branchId: 'cse', year: 3, section: 'A', semester: 5, strength: 60, classRepresentative: 'Rahul Sharma' },
    { id: 'cse3b', name: 'CSE-3B', branchId: 'cse', year: 3, section: 'B', semester: 5, strength: 58, classRepresentative: 'Priya Patel' },
    { id: 'cse3c', name: 'CSE-3C', branchId: 'cse', year: 3, section: 'C', semester: 5, strength: 62, classRepresentative: 'Arjun Kumar' },
    { id: 'cse3d', name: 'CSE-3D', branchId: 'cse', year: 3, section: 'D', semester: 5, strength: 60, classRepresentative: 'Sneha Gupta' },
    
    // ECE Classes
    { id: 'ece3a', name: 'ECE-3A', branchId: 'ece', year: 3, section: 'A', semester: 5, strength: 60, classRepresentative: 'Vikash Singh' },
    { id: 'ece3b', name: 'ECE-3B', branchId: 'ece', year: 3, section: 'B', semester: 5, strength: 58, classRepresentative: 'Anjali Rao' },
    { id: 'ece3c', name: 'ECE-3C', branchId: 'ece', year: 3, section: 'C', semester: 5, strength: 62, classRepresentative: 'Rohit Verma' },
    
    // ME Classes
    { id: 'me3a', name: 'ME-3A', branchId: 'me', year: 3, section: 'A', semester: 5, strength: 60, classRepresentative: 'Suresh Kumar' },
    { id: 'me3b', name: 'ME-3B', branchId: 'me', year: 3, section: 'B', semester: 5, strength: 60, classRepresentative: 'Kavita Sharma' }
  ]

  return {
    institution: {
      name: 'Bharatiya Institute of Technology & Engineering',
      type: 'college',
      address: 'Sector 15, Knowledge Park, Greater Noida, Uttar Pradesh 201310',
      phone: '+91-120-2345678',
      email: 'info@bite.edu.in',
      academicYear: '2025-26',
      currentSemester: 5
    },
    branches,
    subjects,
    teachers,
    rooms,
    classGroups,
    timetablePreferences: {
      startTime: '09:00',
      endTime: '17:00',
      lunchBreak: '13:00-14:00',
      periodDuration: 60,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      maxPeriodsPerDay: 7,
      breakBetweenPeriods: 10
    }
  }
}

export function generateRealisticTimetableData() {
  const demoData = generateRealisticDemoData()
  
  // Generate a realistic weekly timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ]
  
  const timetable: Record<string, Record<string, any>> = {}
  
  days.forEach(day => {
    timetable[day] = {}
    timeSlots.forEach(slot => {
      if (slot === '13:00-14:00') {
        timetable[day][slot] = {
          subject: 'LUNCH BREAK',
          teacher: '',
          room: '',
          type: 'break',
          isBreak: true
        }
      } else {
        // Assign realistic sessions
        const randomSubject = demoData.subjects[Math.floor(Math.random() * demoData.subjects.length)]
        const randomTeacher = demoData.teachers.find(t => 
          t.branchAffiliation.includes(randomSubject.branchId) || randomSubject.branchId === 'common'
        ) || demoData.teachers[0]
        const randomRoom = randomSubject.type === 'lab' 
          ? demoData.rooms.find(r => r.type === 'laboratory') || demoData.rooms[0]
          : demoData.rooms.find(r => r.type === 'classroom') || demoData.rooms[0]
        
        timetable[day][slot] = {
          subject: randomSubject.name,
          subjectCode: randomSubject.code,
          teacher: randomTeacher.name,
          room: randomRoom.code,
          type: randomSubject.type,
          credits: randomSubject.credits,
          isLab: randomSubject.type === 'lab'
        }
      }
    })
  })
  
  return {
    demoData,
    timetable,
    statistics: {
      totalSubjects: demoData.subjects.length,
      totalTeachers: demoData.teachers.length,
      totalRooms: demoData.rooms.length,
      totalClasses: demoData.classGroups.length,
      totalStudents: demoData.branches.reduce((sum, branch) => sum + branch.totalStudents, 0),
      averageClassSize: Math.round(demoData.classGroups.reduce((sum, cls) => sum + cls.strength, 0) / demoData.classGroups.length)
    }
  }
}
