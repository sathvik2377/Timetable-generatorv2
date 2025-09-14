'use client'

import React, { useState } from 'react'
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Play,
  Upload, 
  Download,
  Plus,
  Trash2
} from 'lucide-react'

// Enhanced Subjects Step with NEP-2020 compliance
interface SubjectsStepProps {
  data: any[]
  branches: any[]
  onDataChange: (data: any[]) => void
  onFileUpload: (file: File) => void
  onTemplateDownload: () => void
}

export function SubjectsStep({ 
  data, 
  branches, 
  onDataChange, 
  onFileUpload, 
  onTemplateDownload 
}: SubjectsStepProps) {
  const addSubject = () => {
    const newSubject = {
      id: Date.now(),
      code: '',
      name: '',
      branchCode: branches[0]?.code || '',
      type: 'theory',
      credits: 3,
      weeklyHours: 3,
      minutesPerSlot: 60,
      semester: 1,
      year: 1
    }
    onDataChange([...data, newSubject])
  }

  const addSampleIndianSubjects = () => {
    const sampleSubjects = [
      { id: Date.now() + 1, code: 'CS101', name: 'Programming Fundamentals', branchCode: 'CSE', type: 'theory', credits: 4, weeklyHours: 4, minutesPerSlot: 60, semester: 1, year: 1 },
      { id: Date.now() + 2, code: 'CS102L', name: 'Programming Lab', branchCode: 'CSE', type: 'lab', credits: 2, weeklyHours: 3, minutesPerSlot: 120, semester: 1, year: 1 },
      { id: Date.now() + 3, code: 'MA101', name: 'Engineering Mathematics-I', branchCode: 'CSE', type: 'theory', credits: 4, weeklyHours: 4, minutesPerSlot: 60, semester: 1, year: 1 },
      { id: Date.now() + 4, code: 'PH101', name: 'Engineering Physics', branchCode: 'CSE', type: 'theory', credits: 3, weeklyHours: 3, minutesPerSlot: 60, semester: 1, year: 1 },
      { id: Date.now() + 5, code: 'GE101', name: 'Environmental Science', branchCode: 'CSE', type: 'ability_enhancement', credits: 3, weeklyHours: 3, minutesPerSlot: 60, semester: 1, year: 1 }
    ]
    onDataChange([...data, ...sampleSubjects])
  }

  const copyFromPreviousBranch = () => {
    if (branches.length > 1) {
      const previousBranchSubjects = data.filter(s => s.branchCode === branches[0]?.code)
      const copiedSubjects = previousBranchSubjects.map(s => ({
        ...s,
        id: Date.now() + Math.random(),
        branchCode: branches[1]?.code || branches[0]?.code
      }))
      onDataChange([...data, ...copiedSubjects])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
        <BookOpen className="w-5 h-5" />
        <span className="font-medium">Configure NEP-2020 compliant subjects</span>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subject Configuration</h3>
        <div className="flex space-x-2">
          <button
            onClick={copyFromPreviousBranch}
            className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800"
          >
            Copy Previous Branch
          </button>
          <button
            onClick={addSampleIndianSubjects}
            className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800"
          >
            Sample Indian Subjects
          </button>
          <button
            onClick={onTemplateDownload}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Template</span>
          </button>
          <button
            onClick={() => document.getElementById('subjects-upload')?.click()}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center space-x-1"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <input
            id="subjects-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={addSubject}
            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.map((subject, index) => (
          <div key={subject.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="grid md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Code *
                </label>
                <input
                  type="text"
                  value={subject.code || ''}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, code: e.target.value }
                    onDataChange(updated)
                  }}
                  placeholder="CS101"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={subject.name || ''}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, name: e.target.value }
                    onDataChange(updated)
                  }}
                  placeholder="Programming Fundamentals"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch
                </label>
                <select
                  value={subject.branchCode || ''}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, branchCode: e.target.value }
                    onDataChange(updated)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {branches.map(branch => (
                    <option key={branch.code} value={branch.code}>{branch.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type (NEP-2020)
                </label>
                <select
                  value={subject.type || 'theory'}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, type: e.target.value }
                    onDataChange(updated)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Laboratory</option>
                  <option value="project">Project</option>
                  <option value="ability_enhancement">Ability Enhancement</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const updated = data.filter((_, i) => i !== index)
                    onDataChange(updated)
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  value={subject.credits || 3}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, credits: parseInt(e.target.value) }
                    onDataChange(updated)
                  }}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weekly Hours
                </label>
                <input
                  type="number"
                  value={subject.weeklyHours || 3}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, weeklyHours: parseInt(e.target.value) }
                    onDataChange(updated)
                  }}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutes/Slot
                </label>
                <select
                  value={subject.minutesPerSlot || 60}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, minutesPerSlot: parseInt(e.target.value) }
                    onDataChange(updated)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                  <option value={120}>120 min</option>
                  <option value={180}>180 min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  value={subject.semester || 1}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, semester: parseInt(e.target.value) }
                    onDataChange(updated)
                  }}
                  min="1"
                  max="8"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={subject.year || 1}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...subject, year: parseInt(e.target.value) }
                    onDataChange(updated)
                  }}
                  min="1"
                  max="4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No subjects added yet. Click "Add Subject" or use sample data to get started.</p>
        </div>
      )}
    </div>
  )
}

// Enhanced Teachers Step with NEP-2020 compliance
interface TeachersStepProps {
  data: any[]
  subjects: any[]
  branches: any[]
  onDataChange: (data: any[]) => void
  onFileUpload: (file: File) => void
  onTemplateDownload: () => void
}

export function TeachersStep({
  data,
  subjects,
  branches,
  onDataChange,
  onFileUpload,
  onTemplateDownload
}: TeachersStepProps) {
  const addTeacher = () => {
    const newTeacher = {
      id: Date.now(),
      teacherId: '',
      name: '',
      email: '',
      department: branches[0]?.code || '',
      designation: 'assistant_professor',
      maxHoursPerWeek: 24,
      subjectsTaught: [],
      classesAssigned: []
    }
    onDataChange([...data, newTeacher])
  }

  const addDemoIndianTeachers = () => {
    const demoTeachers = [
      { id: Date.now() + 1, teacherId: 'T001', name: 'Dr. Arjun Sharma', email: 'arjun.sharma@college.edu', department: 'CSE', designation: 'professor', maxHoursPerWeek: 20, subjectsTaught: ['CS101'], classesAssigned: ['CSE'] },
      { id: Date.now() + 2, teacherId: 'T002', name: 'Prof. Priya Patel', email: 'priya.patel@college.edu', department: 'CSE', designation: 'associate_professor', maxHoursPerWeek: 22, subjectsTaught: ['CS102L'], classesAssigned: ['CSE'] },
      { id: Date.now() + 3, teacherId: 'T003', name: 'Dr. Anjali Singh', email: 'anjali.singh@college.edu', department: 'ECE', designation: 'assistant_professor', maxHoursPerWeek: 24, subjectsTaught: [], classesAssigned: ['ECE'] },
      { id: Date.now() + 4, teacherId: 'T004', name: 'Mr. Vikram Kumar', email: 'vikram.kumar@college.edu', department: 'ME', designation: 'lecturer', maxHoursPerWeek: 18, subjectsTaught: [], classesAssigned: ['ME'] },
      { id: Date.now() + 5, teacherId: 'T005', name: 'Ms. Kavya Reddy', email: 'kavya.reddy@college.edu', department: 'CE', designation: 'assistant_professor', maxHoursPerWeek: 20, subjectsTaught: [], classesAssigned: ['CE'] }
    ]
    onDataChange([...data, ...demoTeachers])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
        <Users className="w-5 h-5" />
        <span className="font-medium">Configure faculty with NEP-2020 teaching load management</span>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faculty Information</h3>
        <div className="flex space-x-2">
          <button
            onClick={addDemoIndianTeachers}
            className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800"
          >
            Demo Indian Names
          </button>
          <button
            onClick={onTemplateDownload}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Template</span>
          </button>
          <button
            onClick={() => document.getElementById('teachers-upload')?.click()}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center space-x-1"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <input
            id="teachers-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={addTeacher}
            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teacher</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {data.map((teacher, index) => (
          <div key={teacher.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teacher ID *
                </label>
                <input
                  type="text"
                  value={teacher.teacherId || ''}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...teacher, teacherId: e.target.value }
                    onDataChange(updated)
                  }}
                  placeholder="T001"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teacher Name *
                </label>
                <input
                  type="text"
                  value={teacher.name || ''}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...teacher, name: e.target.value }
                    onDataChange(updated)
                  }}
                  placeholder="Dr. Arjun Sharma"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={teacher.department || ''}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...teacher, department: e.target.value }
                    onDataChange(updated)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {branches.map(branch => (
                    <option key={branch.code} value={branch.code}>{branch.code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Hours/Week
                </label>
                <input
                  type="number"
                  value={teacher.maxHoursPerWeek || 24}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index] = { ...teacher, maxHoursPerWeek: parseInt(e.target.value) }
                    onDataChange(updated)
                  }}
                  min="12"
                  max="40"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subjects Taught (Multi-select)
                </label>
                <select
                  multiple
                  value={teacher.subjectsTaught || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    const updated = [...data]
                    updated[index] = { ...teacher, subjectsTaught: selected }
                    onDataChange(updated)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm h-24"
                >
                  {subjects.map(subject => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Classes Assigned (Multi-select)
                </label>
                <select
                  multiple
                  value={teacher.classesAssigned || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    const updated = [...data]
                    updated[index] = { ...teacher, classesAssigned: selected }
                    onDataChange(updated)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm h-24"
                >
                  {branches.map(branch => (
                    <option key={branch.code} value={branch.code}>
                      {branch.code} - {branch.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  const updated = data.filter((_, i) => i !== index)
                  onDataChange(updated)
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No teachers added yet. Click "Add Teacher" or use demo data to get started.</p>
        </div>
      )}
    </div>
  )
}

// Review Step
interface ReviewStepProps {
  data: any
  onGenerate: () => void
}

export function ReviewStep({ data, onGenerate }: ReviewStepProps) {
  const stats = {
    branches: data.branches?.length || 0,
    subjects: data.subjects?.length || 0,
    teachers: data.teachers?.length || 0,
    rooms: data.rooms?.length || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Review your configuration and generate timetable</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Institution Details</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Name:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.college?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Academic Year:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.college?.academicYear || '2024-25'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Type:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{data.college?.type || 'college'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Working Days:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.college?.workingDays?.join(', ') || 'Mon-Fri'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Max Teacher Hours:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.college?.maxTeacherHoursPerWeek || 24} hrs/week</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.branches}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Branches</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.subjects}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Subjects</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.teachers}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Teachers</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.rooms}</div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Rooms</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Generate!</h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your NEP-2020 compliant timetable configuration is complete. Click the button below to generate an optimized timetable using advanced AI algorithms.
        </p>
        <button
          onClick={onGenerate}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Play className="w-5 h-5" />
          <span>Generate Timetable</span>
        </button>
      </div>
    </div>
  )
}

// Results Step
interface ResultsStepProps {
  data: any
  onExport: (format: string) => void
}

export function ResultsStep({ data, onExport }: ResultsStepProps) {
  const [activeTab, setActiveTab] = useState('CSE')

  // Mock timetable data for demonstration
  const mockTimetable = {
    CSE: [
      { day: 'Monday', slots: ['CS101', 'MA101', 'LUNCH', 'PH101', 'CS102L'] },
      { day: 'Tuesday', slots: ['CS102L', 'MA101', 'LUNCH', 'CS101', 'GE101'] },
      { day: 'Wednesday', slots: ['PH101', 'CS101', 'LUNCH', 'MA101', 'CS102L'] },
      { day: 'Thursday', slots: ['GE101', 'PH101', 'LUNCH', 'CS102L', 'MA101'] },
      { day: 'Friday', slots: ['MA101', 'GE101', 'LUNCH', 'CS101', 'PH101'] }
    ]
  }

  const accuracyScore = 92.5

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Timetable generated successfully!</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Accuracy Score:</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">{accuracyScore}%</span>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onExport('excel')}
          className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 text-sm"
        >
          Export Excel
        </button>
        <button
          onClick={() => onExport('pdf')}
          className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 text-sm"
        >
          Export PDF
        </button>
        <button
          onClick={() => onExport('json')}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
        >
          Export JSON
        </button>
        <button
          onClick={() => onExport('png')}
          className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 text-sm"
        >
          Export PNG
        </button>
      </div>

      {/* Branch Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
        {(data.branches || []).map((branch: any) => (
          <button
            key={branch.code}
            onClick={() => setActiveTab(branch.code)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === branch.code
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {branch.code}
          </button>
        ))}
      </div>

      {/* Timetable Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Day</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">9:00-10:00</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">10:00-11:00</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">11:00-12:00</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">13:00-14:00</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">14:00-15:00</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {(mockTimetable[activeTab as keyof typeof mockTimetable] || []).map((daySchedule: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{daySchedule.day}</td>
                  {daySchedule.slots.map((slot: string, slotIndex: number) => (
                    <td key={slotIndex} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {slot === 'LUNCH' ? (
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">
                          LUNCH
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                          {slot}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
