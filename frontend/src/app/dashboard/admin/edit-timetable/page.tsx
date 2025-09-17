"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Eye, Edit3, Trash2, Plus, AlertTriangle, CheckCircle, RefreshCw, Building2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  code: string;
  totalStudents: number;
  subjects: Subject[];
  teachers: Teacher[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'theory' | 'practical' | 'tutorial';
  hoursPerWeek: number;
  branchId: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  maxHoursPerDay: number;
  branchIds: string[];
}

interface TimetableSlot {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'theory' | 'practical' | 'tutorial' | 'break';
  students: number;
  branchId: string;
}

interface Conflict {
  type: 'teacher' | 'room' | 'subject';
  message: string;
  severity: 'warning' | 'error';
  affectedSlots: { day: string; timeSlot: string; branchId: string }[];
}

export default function AdminEditTimetablePage() {
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: 'cs',
      name: 'Computer Science',
      code: 'CS',
      totalStudents: 60,
      subjects: [
        { id: 'ds', name: 'Data Structures', code: 'CS301', type: 'theory', hoursPerWeek: 4, branchId: 'cs' },
        { id: 'algo', name: 'Algorithms', code: 'CS302', type: 'theory', hoursPerWeek: 3, branchId: 'cs' },
        { id: 'prog', name: 'Programming Lab', code: 'CS303', type: 'practical', hoursPerWeek: 4, branchId: 'cs' }
      ],
      teachers: [
        { id: 't1', name: 'Dr. Smith', email: 'smith@demo.local', subjects: ['ds', 'algo'], maxHoursPerDay: 6, branchIds: ['cs'] },
        { id: 't2', name: 'Prof. Johnson', email: 'johnson@demo.local', subjects: ['prog'], maxHoursPerDay: 6, branchIds: ['cs'] }
      ]
    },
    {
      id: 'ece',
      name: 'Electronics & Communication',
      code: 'ECE',
      totalStudents: 45,
      subjects: [
        { id: 'signals', name: 'Signals & Systems', code: 'ECE301', type: 'theory', hoursPerWeek: 4, branchId: 'ece' },
        { id: 'circuits', name: 'Circuit Analysis', code: 'ECE302', type: 'theory', hoursPerWeek: 3, branchId: 'ece' },
        { id: 'lab', name: 'Electronics Lab', code: 'ECE303', type: 'practical', hoursPerWeek: 4, branchId: 'ece' }
      ],
      teachers: [
        { id: 't3', name: 'Dr. Williams', email: 'williams@demo.local', subjects: ['signals', 'circuits'], maxHoursPerDay: 6, branchIds: ['ece'] },
        { id: 't4', name: 'Prof. Brown', email: 'brown@demo.local', subjects: ['lab'], maxHoursPerDay: 6, branchIds: ['ece'] }
      ]
    }
  ]);

  const [selectedBranch, setSelectedBranch] = useState<string>('cs');
  const [timetables, setTimetables] = useState<{ [branchId: string]: { [day: string]: { [timeSlot: string]: TimetableSlot | null } } }>({});
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: string, timeSlot: string} | null>(null);
  const [newClass, setNewClass] = useState({
    subject: '',
    teacher: '',
    room: '',
    type: 'theory' as 'theory' | 'practical' | 'tutorial',
    students: 30
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([
    { id: 'standard', name: 'Standard Template', description: 'Basic 6-day schedule with common subjects' },
    { id: 'intensive', name: 'Intensive Template', description: 'High-density schedule with more hours per day' },
    { id: 'balanced', name: 'Balanced Template', description: 'Optimized for work-life balance' }
  ]);

  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Initialize timetables for all branches
  useEffect(() => {
    const initialTimetables: any = {};
    branches.forEach(branch => {
      initialTimetables[branch.id] = {};
      days.forEach(day => {
        initialTimetables[branch.id][day] = {};
        timeSlots.forEach(timeSlot => {
          if (timeSlot === '13:00-14:00') {
            initialTimetables[branch.id][day][timeSlot] = {
              id: `lunch-${branch.id}-${day}-${timeSlot}`,
              subject: 'Lunch Break',
              teacher: '',
              room: '',
              type: 'break',
              students: 0,
              branchId: branch.id
            };
          } else {
            initialTimetables[branch.id][day][timeSlot] = null;
          }
        });
      });
    });
    setTimetables(initialTimetables);
  }, [branches]);

  // Conflict detection function
  const detectConflicts = () => {
    const detectedConflicts: Conflict[] = [];
    const teacherSchedule: { [teacherId: string]: { day: string; timeSlot: string; branchId: string }[] } = {};
    const roomSchedule: { [room: string]: { day: string; timeSlot: string; branchId: string }[] } = {};

    // Analyze all timetables for conflicts
    Object.keys(timetables).forEach(branchId => {
      const branchTimetable = timetables[branchId];
      Object.keys(branchTimetable).forEach(day => {
        Object.keys(branchTimetable[day]).forEach(timeSlot => {
          const slot = branchTimetable[day][timeSlot];
          if (slot && slot.type !== 'break') {
            // Check teacher conflicts
            if (slot.teacher) {
              if (!teacherSchedule[slot.teacher]) {
                teacherSchedule[slot.teacher] = [];
              }
              teacherSchedule[slot.teacher].push({ day, timeSlot, branchId });
            }

            // Check room conflicts
            if (slot.room) {
              if (!roomSchedule[slot.room]) {
                roomSchedule[slot.room] = [];
              }
              roomSchedule[slot.room].push({ day, timeSlot, branchId });
            }
          }
        });
      });
    });

    // Detect teacher conflicts
    Object.keys(teacherSchedule).forEach(teacherId => {
      const schedule = teacherSchedule[teacherId];
      const conflictGroups: { [key: string]: typeof schedule } = {};
      
      schedule.forEach(slot => {
        const key = `${slot.day}-${slot.timeSlot}`;
        if (!conflictGroups[key]) {
          conflictGroups[key] = [];
        }
        conflictGroups[key].push(slot);
      });

      Object.keys(conflictGroups).forEach(key => {
        if (conflictGroups[key].length > 1) {
          detectedConflicts.push({
            type: 'teacher',
            message: `Teacher ${teacherId} has conflicting classes at ${key.replace('-', ' ')}`,
            severity: 'error',
            affectedSlots: conflictGroups[key]
          });
        }
      });
    });

    // Detect room conflicts
    Object.keys(roomSchedule).forEach(room => {
      const schedule = roomSchedule[room];
      const conflictGroups: { [key: string]: typeof schedule } = {};
      
      schedule.forEach(slot => {
        const key = `${slot.day}-${slot.timeSlot}`;
        if (!conflictGroups[key]) {
          conflictGroups[key] = [];
        }
        conflictGroups[key].push(slot);
      });

      Object.keys(conflictGroups).forEach(key => {
        if (conflictGroups[key].length > 1) {
          detectedConflicts.push({
            type: 'room',
            message: `Room ${room} has conflicting bookings at ${key.replace('-', ' ')}`,
            severity: 'warning',
            affectedSlots: conflictGroups[key]
          });
        }
      });
    });

    setConflicts(detectedConflicts);
  };

  // Run conflict detection whenever timetables change
  useEffect(() => {
    if (Object.keys(timetables).length > 0) {
      detectConflicts();
    }
  }, [timetables]);

  const handleDragStart = (e: React.DragEvent, day: string, timeSlot: string, slot: TimetableSlot) => {
    const dragItem = { day, timeSlot, slot, branchId: selectedBranch };
    setDraggedItem(dragItem);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTimeSlot: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const targetSlot = timetables[selectedBranch]?.[targetDay]?.[targetTimeSlot];
    if (targetSlot && targetSlot.type === 'break') return;

    const newTimetables = { ...timetables };
    
    // Remove from original position
    newTimetables[draggedItem.branchId][draggedItem.day][draggedItem.timeSlot] = null;
    
    // Add to new position (swap if occupied)
    if (targetSlot) {
      newTimetables[draggedItem.branchId][draggedItem.day][draggedItem.timeSlot] = targetSlot;
    }
    newTimetables[selectedBranch][targetDay][targetTimeSlot] = {
      ...draggedItem.slot,
      branchId: selectedBranch
    };

    setTimetables(newTimetables);
    setDraggedItem(null);
    setHasChanges(true);
  };

  const handleAddClass = (day: string, timeSlot: string) => {
    setSelectedSlot({ day, timeSlot });
    setNewClass({
      subject: '',
      teacher: '',
      room: '',
      type: 'theory',
      students: 30
    });
    setShowAddClassModal(true);
  };

  const handleSaveNewClass = () => {
    if (!selectedSlot || !newClass.subject.trim() || !newClass.teacher.trim()) {
      alert('Please fill in all required fields (Subject and Teacher)');
      return;
    }

    const newTimetables = { ...timetables };
    const newSlot: TimetableSlot = {
      id: `${selectedSlot.day}-${selectedSlot.timeSlot}-${Date.now()}`,
      subject: newClass.subject,
      teacher: newClass.teacher,
      room: newClass.room || 'TBD',
      type: newClass.type,
      students: newClass.students,
      branchId: selectedBranch
    };

    newTimetables[selectedBranch][selectedSlot.day][selectedSlot.timeSlot] = newSlot;
    setTimetables(newTimetables);
    setHasChanges(true);
    setShowAddClassModal(false);
    setSelectedSlot(null);
  };

  const handleSave = async () => {
    setIsAnalyzing(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHasChanges(false);
    setIsAnalyzing(false);
    alert('Timetable saved successfully!');
  };

  const handleExport = (format: 'html' | 'csv' | 'pdf') => {
    const currentBranch = branches.find(b => b.id === selectedBranch);
    const filename = `${currentBranch?.name || 'timetable'}-${format}`;
    
    if (format === 'html') {
      const htmlContent = generateHTMLExport();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      downloadFile(blob, `${filename}.html`);
    } else if (format === 'csv') {
      const csvContent = generateCSVExport();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      downloadFile(blob, `${filename}.csv`);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTMLExport = () => {
    const currentBranch = branches.find(b => b.id === selectedBranch);
    const branchTimetable = timetables[selectedBranch] || {};
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentBranch?.name} - Timetable</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
          .break { background-color: #fff3cd; }
          .theory { background-color: #d4edda; }
          .practical { background-color: #cce5ff; }
          .tutorial { background-color: #f8d7da; }
        </style>
      </head>
      <body>
        <h1>${currentBranch?.name} - Timetable</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <tr><th>Time</th>${days.map(day => `<th>${day}</th>`).join('')}</tr>
    `;

    timeSlots.forEach(timeSlot => {
      html += `<tr><td><strong>${timeSlot}</strong></td>`;
      days.forEach(day => {
        const slot = branchTimetable[day]?.[timeSlot];
        if (slot) {
          html += `<td class="${slot.type}">
            <div><strong>${slot.subject}</strong></div>
            ${slot.teacher ? `<div>${slot.teacher}</div>` : ''}
            ${slot.room ? `<div>(${slot.room})</div>` : ''}
          </td>`;
        } else {
          html += '<td>-</td>';
        }
      });
      html += '</tr>';
    });

    html += `
        </table>
      </body>
      </html>
    `;

    return html;
  };

  const generateCSVExport = () => {
    const currentBranch = branches.find(b => b.id === selectedBranch);
    const branchTimetable = timetables[selectedBranch] || {};
    
    let csv = `${currentBranch?.name} Timetable\n`;
    csv += 'Day,Time,Subject,Teacher,Room,Type\n';
    
    days.forEach(day => {
      timeSlots.forEach(timeSlot => {
        const slot = branchTimetable[day]?.[timeSlot];
        if (slot) {
          csv += `${day},${timeSlot},${slot.subject},${slot.teacher || ''},${slot.room || ''},${slot.type}\n`;
        }
      });
    });
    
    return csv;
  };

  // Auto-generate timetable functionality
  const autoGenerateTimetable = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate timetable
      await new Promise(resolve => setTimeout(resolve, 2000));

      const currentBranch = branches.find(b => b.id === selectedBranch);
      if (!currentBranch) return;

      const newTimetable: { [day: string]: { [timeSlot: string]: TimetableSlot | null } } = {};

      // Initialize empty timetable
      days.forEach(day => {
        newTimetable[day] = {};
        timeSlots.forEach(slot => {
          newTimetable[day][slot] = null;
        });
      });

      // Simple algorithm to distribute subjects
      let subjectIndex = 0;
      let teacherIndex = 0;

      days.forEach((day, dayIndex) => {
        timeSlots.forEach((slot, slotIndex) => {
          // Skip lunch break
          if (slot === '13:00-14:00') {
            newTimetable[day][slot] = {
              id: `break-${dayIndex}-${slotIndex}`,
              subject: 'Lunch Break',
              teacher: '',
              room: '',
              type: 'break',
              students: 0,
              branchId: selectedBranch
            };
            return;
          }

          const subject = currentBranch.subjects[subjectIndex % currentBranch.subjects.length];
          const teacher = currentBranch.teachers[teacherIndex % currentBranch.teachers.length];

          newTimetable[day][slot] = {
            id: `${selectedBranch}-${dayIndex}-${slotIndex}`,
            subject: subject.name,
            teacher: teacher.name,
            room: `Room ${Math.floor(Math.random() * 10) + 101}`,
            type: subject.type,
            students: currentBranch.totalStudents,
            branchId: selectedBranch
          };

          subjectIndex++;
          if (subjectIndex % 2 === 0) teacherIndex++;
        });
      });

      setTimetables(prev => ({
        ...prev,
        [selectedBranch]: newTimetable
      }));

      setHasChanges(true);
      // analyzeConflicts(); // TODO: Implement conflict analysis

    } catch (error) {
      console.error('Failed to generate timetable:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear all slots functionality
  const clearAllSlots = () => {
    const emptyTimetable: { [day: string]: { [timeSlot: string]: TimetableSlot | null } } = {};

    days.forEach(day => {
      emptyTimetable[day] = {};
      timeSlots.forEach(slot => {
        if (slot === '13:00-14:00') {
          emptyTimetable[day][slot] = {
            id: `break-${day}-${slot}`,
            subject: 'Lunch Break',
            teacher: '',
            room: '',
            type: 'break',
            students: 0,
            branchId: selectedBranch
          };
        } else {
          emptyTimetable[day][slot] = null;
        }
      });
    });

    setTimetables(prev => ({
      ...prev,
      [selectedBranch]: emptyTimetable
    }));

    setHasChanges(true);
    setConflicts([]);
  };

  // Apply template functionality
  const applyTemplate = (templateId: string) => {
    const currentBranch = branches.find(b => b.id === selectedBranch);
    if (!currentBranch) return;

    const newTimetable: { [day: string]: { [timeSlot: string]: TimetableSlot | null } } = {};

    // Initialize with lunch breaks
    days.forEach(day => {
      newTimetable[day] = {};
      timeSlots.forEach(slot => {
        if (slot === '13:00-14:00') {
          newTimetable[day][slot] = {
            id: `break-${day}-${slot}`,
            subject: 'Lunch Break',
            teacher: '',
            room: '',
            type: 'break',
            students: 0,
            branchId: selectedBranch
          };
        } else {
          // Apply template pattern
          const subjectIndex = timeSlots.indexOf(slot) % currentBranch.subjects.length;
          const teacherIndex = Math.floor(timeSlots.indexOf(slot) / 2) % currentBranch.teachers.length;
          const subject = currentBranch.subjects[subjectIndex];
          const teacher = currentBranch.teachers[teacherIndex];

          newTimetable[day][slot] = {
            id: `${selectedBranch}-${day}-${slot}`,
            subject: subject.name,
            teacher: teacher.name,
            room: `Room ${Math.floor(Math.random() * 10) + 101}`,
            type: subject.type,
            students: currentBranch.totalStudents,
            branchId: selectedBranch
          };
        }
      });
    });

    setTimetables(prev => ({
      ...prev,
      [selectedBranch]: newTimetable
    }));

    setHasChanges(true);
    setShowTemplateModal(false);
    // analyzeConflicts(); // TODO: Implement conflict analysis
  };

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'practical': return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'tutorial': return 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200';
      case 'break': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-white border-gray-300 text-gray-800';
    }
  };

  const currentBranch = branches.find(b => b.id === selectedBranch);
  const currentTimetable = timetables[selectedBranch] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-high-contrast mb-4">
                🎛️ Admin Timetable Editor
              </h1>
              <p className="text-xl text-readable">
                Manage timetables across all branches with intelligent conflict detection
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleSave}
                disabled={!hasChanges || isAnalyzing}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {isAnalyzing ? 'Analyzing...' : 'Save Changes'}
              </button>
              <div className="relative">
                <select
                  onChange={(e) => handleExport(e.target.value as any)}
                  className="px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Export</option>
                  <option value="html">Export HTML</option>
                  <option value="csv">Export CSV</option>
                  <option value="pdf">Export PDF</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Branch Selection and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-high-contrast mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Branch
            </h3>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
            {currentBranch && (
              <div className="mt-4 space-y-2 text-sm text-readable">
                <p>Students: {currentBranch.totalStudents}</p>
                <p>Subjects: {currentBranch.subjects.length}</p>
                <p>Teachers: {currentBranch.teachers.length}</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-high-contrast mb-4">Conflict Status</h3>
            <div className="space-y-2">
              {conflicts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>No conflicts detected</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{conflicts.length} conflicts found</span>
                  </div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {conflicts.slice(0, 3).map((conflict, index) => (
                      <div key={index} className="text-xs text-readable bg-red-500/10 p-2 rounded">
                        {conflict.message}
                      </div>
                    ))}
                    {conflicts.length > 3 && (
                      <div className="text-xs text-readable">
                        +{conflicts.length - 3} more conflicts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-high-contrast mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={autoGenerateTimetable}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-left text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Auto-Generate Timetable
                  </>
                )}
              </button>
              <button
                onClick={clearAllSlots}
                className="w-full px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all text-left text-purple-400 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Slots
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all text-left text-green-400 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Use Template
              </button>
            </div>
          </motion.div>
        </div>

        {/* Change Indicator */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
          >
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              You have unsaved changes. Don't forget to save your timetable!
            </p>
          </motion.div>
        )}

        {/* Timetable Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass border-0 rounded-lg p-6"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-high-contrast">
              {currentBranch?.name} Timetable
            </h3>
            <div className="flex gap-2 text-sm text-readable">
              <span>Drag classes to move • Click icons to edit/delete</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400 bg-white rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-400 bg-gray-100 p-3 text-center font-bold text-gray-800 min-w-[100px]">
                    Time
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-gray-400 bg-gray-100 p-3 text-center font-bold text-gray-800 min-w-[200px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-400 bg-gray-50 p-3 text-center font-semibold text-gray-800 align-top">
                      {timeSlot}
                    </td>
                    {days.map((day) => {
                      const slot = currentTimetable[day]?.[timeSlot];
                      const hasConflict = conflicts.some(conflict =>
                        conflict.affectedSlots.some(affectedSlot =>
                          affectedSlot.day === day &&
                          affectedSlot.timeSlot === timeSlot &&
                          affectedSlot.branchId === selectedBranch
                        )
                      );

                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="border border-gray-400 p-2 align-top min-h-[100px]"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, timeSlot)}
                        >
                          {slot ? (
                            <div
                              className={`p-3 rounded border-2 cursor-move relative group ${getSlotColor(slot.type)} ${
                                hasConflict ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                              }`}
                              draggable={slot.type !== 'break'}
                              onDragStart={(e) => handleDragStart(e, day, timeSlot, slot)}
                            >
                              {hasConflict && (
                                <div className="absolute -top-1 -right-1">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                </div>
                              )}

                              <div className="font-bold text-sm mb-1">
                                {slot.subject}
                              </div>
                              {slot.teacher && (
                                <div className="text-xs mb-1">
                                  👨‍🏫 {slot.teacher}
                                </div>
                              )}
                              {slot.room && (
                                <div className="text-xs mb-1">
                                  📍 {slot.room}
                                </div>
                              )}
                              {slot.students > 0 && (
                                <div className="text-xs">
                                  👥 {slot.students} students
                                </div>
                              )}

                              {/* Action buttons - only show for non-break slots */}
                              {slot.type !== 'break' && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className="h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, day, timeSlot)}
                              onClick={() => handleAddClass(day, timeSlot)}
                            >
                              <Plus className="h-6 w-6" />
                              <span className="ml-2 text-sm">Add Class</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-sm text-readable">Theory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-readable">Practical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
              <span className="text-sm text-readable">Tutorial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
              <span className="text-sm text-readable">Break</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-readable">Conflict</span>
            </div>
          </div>
        </motion.div>

        {/* Add Class Modal */}
        {showAddClassModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-high-contrast mb-4">
                Add New Class
              </h3>
              <p className="text-sm text-readable mb-4">
                {selectedSlot && `${selectedSlot.day} at ${selectedSlot.timeSlot}`}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-readable mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newClass.subject}
                    onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                    className="w-full px-3 py-2 glass border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-high-contrast"
                    placeholder="Enter subject name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-readable mb-1">
                    Teacher *
                  </label>
                  <input
                    type="text"
                    value={newClass.teacher}
                    onChange={(e) => setNewClass({...newClass, teacher: e.target.value})}
                    className="w-full px-3 py-2 glass border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-high-contrast"
                    placeholder="Enter teacher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-readable mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={newClass.room}
                    onChange={(e) => setNewClass({...newClass, room: e.target.value})}
                    className="w-full px-3 py-2 glass border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-high-contrast"
                    placeholder="Enter room number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-readable mb-1">
                    Type
                  </label>
                  <select
                    value={newClass.type}
                    onChange={(e) => setNewClass({...newClass, type: e.target.value as 'theory' | 'practical' | 'tutorial'})}
                    className="w-full px-3 py-2 glass border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-high-contrast"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-readable mb-1">
                    Students
                  </label>
                  <input
                    type="number"
                    value={newClass.students}
                    onChange={(e) => setNewClass({...newClass, students: parseInt(e.target.value) || 30})}
                    className="w-full px-3 py-2 glass border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-high-contrast"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveNewClass}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Class
                </button>
                <button
                  onClick={() => setShowAddClassModal(false)}
                  className="flex-1 glass-button px-4 py-2 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border-0 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-high-contrast mb-4">Choose Template</h2>
              <p className="text-readable mb-6">Select a template to apply to the current branch timetable.</p>

              <div className="space-y-3">
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className="w-full p-4 text-left glass-card hover:bg-glass-hover transition-all rounded-lg border border-glass-border"
                  >
                    <h3 className="font-semibold text-primary">{template.name}</h3>
                    <p className="text-sm text-muted mt-1">{template.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 glass-button"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
