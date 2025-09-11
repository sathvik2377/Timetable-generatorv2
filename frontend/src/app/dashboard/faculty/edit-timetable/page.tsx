"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Undo, RefreshCw, Eye, EyeOff, Calendar, Clock, MapPin, Users, BookOpen, Edit3, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TimetableSlot {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'theory' | 'practical' | 'tutorial' | 'break';
  students: number;
  classGroup: string;
  isCustom?: boolean;
  originalSlot?: TimetableSlot;
}

interface TeacherPreference {
  preferredTimeSlots: string[];
  avoidTimeSlots: string[];
  maxConsecutiveHours: number;
  preferredRooms: string[];
  notes: string;
}

export default function FacultyEditTimetable() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'official' | 'custom'>('official');
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Sample official timetable data
  const [officialTimetable, setOfficialTimetable] = useState<Record<string, Record<string, TimetableSlot>>>({
    'Monday': {
      '09:00-10:00': { id: '1', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 45, classGroup: 'CS-3A' },
      '10:00-11:00': { id: '2', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 40, classGroup: 'CS-3B' },
      '11:00-12:00': { id: '3', subject: 'Programming Lab', teacher: 'Dr. Smith', room: 'Lab A', type: 'practical', students: 30, classGroup: 'CS-2A' },
      '13:00-14:00': { id: 'lunch', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
      '14:00-15:00': { id: '4', subject: 'Database Systems', teacher: 'Dr. Smith', room: 'Room 102', type: 'theory', students: 35, classGroup: 'CS-4A' },
    },
    'Tuesday': {
      '09:00-10:00': { id: '5', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 40, classGroup: 'CS-3B' },
      '10:00-11:00': { id: '6', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 45, classGroup: 'CS-3A' },
      '11:00-12:00': { id: '7', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
      '13:00-14:00': { id: 'lunch2', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
      '14:00-15:00': { id: '8', subject: 'Programming Lab', teacher: 'Dr. Smith', room: 'Lab A', type: 'practical', students: 30, classGroup: 'CS-2B' },
    },
    'Wednesday': {
      '09:00-10:00': { id: '9', subject: 'Database Systems', teacher: 'Dr. Smith', room: 'Room 102', type: 'theory', students: 35, classGroup: 'CS-4A' },
      '10:00-11:00': { id: '10', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 45, classGroup: 'CS-3A' },
      '11:00-12:00': { id: '11', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 40, classGroup: 'CS-3B' },
      '13:00-14:00': { id: 'lunch3', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
      '14:00-15:00': { id: '12', subject: 'Office Hours', teacher: 'Dr. Smith', room: 'Office 301', type: 'tutorial', students: 10, classGroup: 'Open' },
    },
    'Thursday': {
      '09:00-10:00': { id: '13', subject: 'Programming Lab', teacher: 'Dr. Smith', room: 'Lab A', type: 'practical', students: 30, classGroup: 'CS-2A' },
      '10:00-11:00': { id: '14', subject: 'Programming Lab', teacher: 'Dr. Smith', room: 'Lab A', type: 'practical', students: 30, classGroup: 'CS-2A' },
      '11:00-12:00': { id: '15', subject: 'Database Systems', teacher: 'Dr. Smith', room: 'Room 102', type: 'theory', students: 35, classGroup: 'CS-4A' },
      '13:00-14:00': { id: 'lunch4', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
      '14:00-15:00': { id: '16', subject: 'Research Work', teacher: 'Dr. Smith', room: 'Research Lab', type: 'tutorial', students: 5, classGroup: 'PhD' },
    },
    'Friday': {
      '09:00-10:00': { id: '17', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 40, classGroup: 'CS-3B' },
      '10:00-11:00': { id: '18', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 45, classGroup: 'CS-3A' },
      '11:00-12:00': { id: '19', subject: 'Faculty Meeting', teacher: 'Dr. Smith', room: 'Conference Room', type: 'tutorial', students: 0, classGroup: 'Faculty' },
      '13:00-14:00': { id: 'lunch5', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
      '14:00-15:00': { id: '20', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0, classGroup: '' },
    }
  });

  const [customTimetable, setCustomTimetable] = useState<Record<string, Record<string, TimetableSlot>>>({});
  const [teacherPreferences, setTeacherPreferences] = useState<TeacherPreference>({
    preferredTimeSlots: ['09:00-10:00', '10:00-11:00'],
    avoidTimeSlots: ['15:00-16:00'],
    maxConsecutiveHours: 3,
    preferredRooms: ['Room 101', 'Lab A'],
    notes: 'Prefer morning slots for theory classes'
  });

  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Initialize custom timetable with official timetable
  useEffect(() => {
    if (Object.keys(customTimetable).length === 0) {
      setCustomTimetable(JSON.parse(JSON.stringify(officialTimetable)));
    }
  }, [officialTimetable]);

  const handleDragStart = (e: React.DragEvent, day: string, timeSlot: string, slot: TimetableSlot) => {
    if (!isEditing || viewMode === 'official') return;
    
    const dragItem = { day, timeSlot, slot };
    setDraggedItem(dragItem);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetTimeSlot: string) => {
    e.preventDefault();
    if (!draggedItem || !isEditing || viewMode === 'official') return;

    const newTimetable = { ...customTimetable };
    const { day: sourceDay, timeSlot: sourceTimeSlot, slot } = draggedItem;

    // Remove from source
    delete newTimetable[sourceDay][sourceTimeSlot];

    // Add to target (replace if exists)
    newTimetable[targetDay][targetTimeSlot] = { ...slot, isCustom: true };

    setCustomTimetable(newTimetable);
    setHasChanges(true);
    setDraggedItem(null);
  };

  const saveCustomTimetable = () => {
    // Here you would save to backend
    setHasChanges(false);
    alert('Faculty schedule preferences saved successfully!');
  };

  const resetToOfficial = () => {
    setCustomTimetable(JSON.parse(JSON.stringify(officialTimetable)));
    setHasChanges(false);
  };

  const currentTimetable = viewMode === 'official' ? officialTimetable : customTimetable;

  const getSlotColor = (slot: TimetableSlot) => {
    if (slot.type === 'break') return 'bg-gray-500/20 border-gray-400';
    if (slot.type === 'practical') return 'bg-green-500/20 border-green-400';
    if (slot.type === 'tutorial') return 'bg-purple-500/20 border-purple-400';
    if (slot.isCustom) return 'bg-blue-500/20 border-blue-400';
    return 'bg-indigo-500/20 border-indigo-400';
  };

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-4xl font-bold text-high-contrast mb-4">
                  👨‍🏫 My Teaching Schedule
                </h1>
                <p className="text-xl text-readable">
                  Manage your teaching schedule and set preferences
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {isEditing && hasChanges && (
                <button 
                  onClick={saveCustomTimetable}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <Save className="h-5 w-5" />
                  Save Preferences
                </button>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  isEditing 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Edit3 className="h-5 w-5" />
                {isEditing ? 'Stop Editing' : 'Edit Schedule'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border-0 rounded-lg p-4 mb-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('official')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'official' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Official Schedule
              </button>
              <button
                onClick={() => setViewMode('custom')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'custom' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <EyeOff className="h-4 w-4 inline mr-2" />
                My Preferences
              </button>
            </div>
            
            {viewMode === 'custom' && (
              <div className="flex gap-2">
                <button
                  onClick={resetToOfficial}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset to Official
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Teaching Load Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="glass border-0 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-readable">Total Classes</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {Object.values(currentTimetable).reduce((total, day) => 
                    total + Object.values(day).filter(slot => slot.type !== 'break').length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass border-0 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-readable">Total Students</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {Object.values(currentTimetable).reduce((total, day) => 
                    total + Object.values(day).reduce((dayTotal, slot) => dayTotal + (slot.students || 0), 0), 0
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass border-0 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-readable">Teaching Hours</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {Object.values(currentTimetable).reduce((total, day) => 
                    total + Object.values(day).filter(slot => slot.type !== 'break').length, 0
                  )} hrs/week
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass border-0 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-sm text-readable">Unique Rooms</p>
                <p className="text-2xl font-bold text-high-contrast">
                  {new Set(Object.values(currentTimetable).flatMap(day => 
                    Object.values(day).map(slot => slot.room).filter(room => room)
                  )).size}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timetable Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass border-0 rounded-lg p-6 mb-6"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-high-contrast">
              {viewMode === 'official' ? 'Official Teaching Schedule' : 'My Preferred Schedule'}
            </h3>
            <div className="flex gap-2 text-sm text-readable">
              {isEditing && viewMode === 'custom' && (
                <span>Drag classes to rearrange • Click to edit details</span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-full">
              {/* Header */}
              <div className="font-semibold text-center p-3 bg-gray-700 rounded-lg text-high-contrast">
                Time
              </div>
              {days.map(day => (
                <div key={day} className="font-semibold text-center p-3 bg-gray-700 rounded-lg text-high-contrast">
                  {day}
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                  <div className="font-mono text-sm text-center p-3 bg-gray-800 rounded-lg text-readable">
                    {timeSlot}
                  </div>
                  {days.map(day => {
                    const slot = currentTimetable[day]?.[timeSlot];
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        className={`min-h-[80px] p-2 rounded-lg border-2 border-dashed transition-all ${
                          slot ? getSlotColor(slot) : 'bg-gray-800/50 border-gray-600'
                        } ${isEditing && viewMode === 'custom' ? 'cursor-pointer hover:bg-opacity-30' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, timeSlot)}
                      >
                        {slot && (
                          <div
                            draggable={isEditing && viewMode === 'custom' && slot.type !== 'break'}
                            onDragStart={(e) => handleDragStart(e, day, timeSlot, slot)}
                            className={`h-full p-2 rounded cursor-${isEditing && viewMode === 'custom' ? 'move' : 'default'}`}
                          >
                            <div className="text-xs font-semibold text-high-contrast truncate">
                              {slot.subject}
                            </div>
                            {slot.classGroup && (
                              <div className="text-xs text-readable truncate">
                                {slot.classGroup}
                              </div>
                            )}
                            {slot.room && (
                              <div className="text-xs text-readable truncate flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {slot.room}
                              </div>
                            )}
                            {slot.students > 0 && (
                              <div className="text-xs text-readable truncate flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {slot.students}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Teaching Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass border-0 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-high-contrast mb-6">Teaching Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-readable mb-2">
                Preferred Time Slots
              </label>
              <div className="space-y-2">
                {timeSlots.map(slot => (
                  <label key={slot} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={teacherPreferences.preferredTimeSlots.includes(slot)}
                      onChange={(e) => {
                        const newPreferred = e.target.checked
                          ? [...teacherPreferences.preferredTimeSlots, slot]
                          : teacherPreferences.preferredTimeSlots.filter(s => s !== slot);
                        setTeacherPreferences(prev => ({ ...prev, preferredTimeSlots: newPreferred }));
                        setHasChanges(true);
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-readable">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-readable mb-2">
                Avoid Time Slots
              </label>
              <div className="space-y-2">
                {timeSlots.map(slot => (
                  <label key={slot} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={teacherPreferences.avoidTimeSlots.includes(slot)}
                      onChange={(e) => {
                        const newAvoid = e.target.checked
                          ? [...teacherPreferences.avoidTimeSlots, slot]
                          : teacherPreferences.avoidTimeSlots.filter(s => s !== slot);
                        setTeacherPreferences(prev => ({ ...prev, avoidTimeSlots: newAvoid }));
                        setHasChanges(true);
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-readable">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-readable mb-2">
                Max Consecutive Hours
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={teacherPreferences.maxConsecutiveHours}
                onChange={(e) => {
                  setTeacherPreferences(prev => ({ ...prev, maxConsecutiveHours: parseInt(e.target.value) }));
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-readable mb-2">
                Additional Notes
              </label>
              <textarea
                value={teacherPreferences.notes}
                onChange={(e) => {
                  setTeacherPreferences(prev => ({ ...prev, notes: e.target.value }));
                  setHasChanges(true);
                }}
                rows={3}
                className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Any specific preferences or constraints..."
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
