"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Undo, RefreshCw, Eye, EyeOff, Calendar, Clock, MapPin, Users, BookOpen, Edit3, Trash2, Plus } from 'lucide-react';

interface TimetableSlot {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'theory' | 'practical' | 'tutorial' | 'break';
  students: number;
  isCustom?: boolean;
  originalSlot?: TimetableSlot;
}

interface PersonalPreference {
  preferredTimeSlots: string[];
  avoidTimeSlots: string[];
  studyBreaks: string[];
  notes: string;
}

interface PersonalActivity {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'exercise' | 'hobby' | 'work' | 'personal';
  priority: 'high' | 'medium' | 'low';
  duration: number; // in minutes
  color: string;
}

export default function StudentEditTimetablePage() {
  const [viewMode, setViewMode] = useState<'official' | 'custom'>('official');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: string, timeSlot: string} | null>(null);
  const [personalActivities, setPersonalActivities] = useState<PersonalActivity[]>([
    {
      id: '1',
      title: 'Study Session',
      description: 'Review lecture notes and prepare for next class',
      type: 'study',
      priority: 'high',
      duration: 60,
      color: '#3B82F6'
    },
    {
      id: '2',
      title: 'Gym Workout',
      description: 'Cardio and strength training',
      type: 'exercise',
      priority: 'medium',
      duration: 90,
      color: '#10B981'
    },
    {
      id: '3',
      title: 'Part-time Job',
      description: 'Work at campus library',
      type: 'work',
      priority: 'high',
      duration: 120,
      color: '#F59E0B'
    },
    {
      id: '4',
      title: 'Club Meeting',
      description: 'Computer Science Club weekly meeting',
      type: 'hobby',
      priority: 'medium',
      duration: 60,
      color: '#8B5CF6'
    }
  ]);

  // Official timetable (read-only from institution)
  const [officialTimetable, setOfficialTimetable] = useState<{ [day: string]: { [timeSlot: string]: TimetableSlot | null } }>({
    Monday: {
      '09:00-10:00': { id: '1', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 35 },
      '10:00-11:00': { id: '2', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 35 },
      '11:00-12:00': { id: '3', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0 },
      '12:00-13:00': { id: 'lunch1', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0 },
      '13:00-14:00': { id: '4', subject: 'Programming Lab', teacher: 'Prof. Johnson', room: 'Lab A', type: 'practical', students: 35 },
      '14:00-15:00': { id: '5', subject: 'Programming Lab', teacher: 'Prof. Johnson', room: 'Lab A', type: 'practical', students: 35 }
    },
    Tuesday: {
      '09:00-10:00': { id: '6', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 35 },
      '10:00-11:00': { id: '7', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 35 },
      '11:00-12:00': { id: '8', subject: 'Tutorial', teacher: 'Dr. Smith', room: 'Room 301', type: 'tutorial', students: 20 },
      '12:00-13:00': { id: 'lunch2', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0 },
      '13:00-14:00': { id: '9', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0 },
      '14:00-15:00': { id: '10', subject: 'Office Hours', teacher: 'Dr. Smith', room: 'Office 201', type: 'tutorial', students: 0 }
    },
    Wednesday: {
      '09:00-10:00': { id: '11', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 35 },
      '10:00-11:00': { id: '12', subject: 'Programming Lab', teacher: 'Prof. Johnson', room: 'Lab B', type: 'practical', students: 30 },
      '11:00-12:00': { id: '13', subject: 'Programming Lab', teacher: 'Prof. Johnson', room: 'Lab B', type: 'practical', students: 30 },
      '12:00-13:00': { id: 'lunch3', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0 },
      '13:00-14:00': { id: '14', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 35 },
      '14:00-15:00': { id: '15', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0 }
    },
    Thursday: {
      '09:00-10:00': { id: '16', subject: 'Tutorial', teacher: 'Dr. Smith', room: 'Room 301', type: 'tutorial', students: 20 },
      '10:00-11:00': { id: '17', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 35 },
      '11:00-12:00': { id: '18', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 35 },
      '12:00-13:00': { id: 'lunch4', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0 },
      '13:00-14:00': { id: '19', subject: 'Office Hours', teacher: 'Dr. Smith', room: 'Office 201', type: 'tutorial', students: 0 },
      '14:00-15:00': { id: '20', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0 }
    },
    Friday: {
      '09:00-10:00': { id: '21', subject: 'Programming Lab', teacher: 'Prof. Johnson', room: 'Lab A', type: 'practical', students: 25 },
      '10:00-11:00': { id: '22', subject: 'Programming Lab', teacher: 'Prof. Johnson', room: 'Lab A', type: 'practical', students: 25 },
      '11:00-12:00': { id: '23', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Room 101', type: 'theory', students: 35 },
      '12:00-13:00': { id: 'lunch5', subject: 'Lunch Break', teacher: '', room: '', type: 'break', students: 0 },
      '13:00-14:00': { id: '24', subject: 'Algorithms', teacher: 'Dr. Smith', room: 'Room 205', type: 'theory', students: 35 },
      '14:00-15:00': { id: '25', subject: 'Free Period', teacher: '', room: '', type: 'break', students: 0 }
    }
  });

  // Custom timetable (student's personalized version)
  const [customTimetable, setCustomTimetable] = useState<{ [day: string]: { [timeSlot: string]: TimetableSlot | null } }>({});

  // Personal preferences
  const [preferences, setPreferences] = useState<PersonalPreference>({
    preferredTimeSlots: ['09:00-10:00', '10:00-11:00'],
    avoidTimeSlots: ['14:00-15:00'],
    studyBreaks: ['11:00-12:00'],
    notes: 'I prefer morning classes and need study breaks between practical sessions.'
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

    const targetSlot = customTimetable[targetDay]?.[targetTimeSlot];
    if (targetSlot && targetSlot.type === 'break' && targetSlot.subject === 'Lunch Break') return;

    const newTimetable = { ...customTimetable };
    
    // Remove from original position
    newTimetable[draggedItem.day][draggedItem.timeSlot] = null;
    
    // Add to new position (swap if occupied)
    if (targetSlot) {
      newTimetable[draggedItem.day][draggedItem.timeSlot] = targetSlot;
    }
    newTimetable[targetDay][targetTimeSlot] = {
      ...draggedItem.slot,
      isCustom: true,
      originalSlot: officialTimetable[draggedItem.day]?.[draggedItem.timeSlot] || undefined
    };

    setCustomTimetable(newTimetable);
    setDraggedItem(null);
    setHasChanges(true);
  };

  const openActivityModal = (day: string, timeSlot: string) => {
    if (!isEditing || viewMode === 'official') return;
    setSelectedSlot({ day, timeSlot });
    setShowActivityModal(true);
  };

  const addPersonalActivity = (activity: PersonalActivity) => {
    if (!selectedSlot) return;

    const { day, timeSlot } = selectedSlot;
    const newActivity: TimetableSlot = {
      id: `custom-${Date.now()}`,
      subject: activity.title,
      teacher: 'Personal',
      room: activity.type === 'study' ? 'Library/Study Room' :
            activity.type === 'exercise' ? 'Gym/Sports Complex' :
            activity.type === 'work' ? 'Workplace' :
            activity.type === 'hobby' ? 'Club Room' : 'Personal Space',
      type: activity.type === 'study' ? 'tutorial' : 'break',
      students: 1,
      isCustom: true
    };

    const newTimetable = { ...customTimetable };
    newTimetable[day][timeSlot] = newActivity;
    setCustomTimetable(newTimetable);
    setHasChanges(true);
    setShowActivityModal(false);
    setSelectedSlot(null);
  };

  const createNewActivity = (title: string, description: string, type: PersonalActivity['type']) => {
    const newActivity: PersonalActivity = {
      id: Date.now().toString(),
      title,
      description,
      type,
      priority: 'medium',
      duration: 60,
      color: type === 'study' ? '#3B82F6' :
             type === 'exercise' ? '#10B981' :
             type === 'work' ? '#F59E0B' :
             type === 'hobby' ? '#8B5CF6' : '#6B7280'
    };

    setPersonalActivities(prev => [...prev, newActivity]);
    addPersonalActivity(newActivity);
  };

  const removeCustomActivity = (day: string, timeSlot: string) => {
    if (!isEditing || viewMode === 'official') return;

    const slot = customTimetable[day]?.[timeSlot];
    if (!slot?.isCustom) return;

    const newTimetable = { ...customTimetable };
    
    // Restore original slot if it exists
    if (slot.originalSlot) {
      newTimetable[day][timeSlot] = slot.originalSlot;
    } else {
      newTimetable[day][timeSlot] = null;
    }

    setCustomTimetable(newTimetable);
    setHasChanges(true);
  };

  const resetToOfficial = () => {
    setCustomTimetable(JSON.parse(JSON.stringify(officialTimetable)));
    setHasChanges(false);
  };

  const saveCustomTimetable = () => {
    // Save to localStorage or send to backend
    localStorage.setItem('studentCustomTimetable', JSON.stringify(customTimetable));
    localStorage.setItem('studentPreferences', JSON.stringify(preferences));
    setHasChanges(false);
    alert('Your custom timetable has been saved!');
  };

  const getCurrentTimetable = () => {
    return viewMode === 'official' ? officialTimetable : customTimetable;
  };

  const getSlotColor = (type: string, isCustom?: boolean) => {
    const baseColors = {
      theory: 'bg-blue-100 border-blue-300 text-blue-800',
      practical: 'bg-green-100 border-green-300 text-green-800',
      tutorial: 'bg-teal-100 border-teal-300 text-teal-800',
      break: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };

    const customColors = {
      theory: 'bg-blue-200 border-blue-400 text-blue-900',
      practical: 'bg-green-200 border-green-400 text-green-900',
      tutorial: 'bg-teal-200 border-teal-400 text-teal-900',
      break: 'bg-yellow-200 border-yellow-400 text-yellow-900'
    };

    return isCustom ? customColors[type as keyof typeof customColors] : baseColors[type as keyof typeof baseColors];
  };

  const currentTimetable = getCurrentTimetable();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-6">
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
                📚 My Personal Timetable
              </h1>
              <p className="text-xl text-readable">
                Customize your schedule according to your preferences
              </p>
            </div>
            <div className="flex gap-3">
              {isEditing && hasChanges && (
                <button 
                  onClick={saveCustomTimetable}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                >
                  <Save className="h-5 w-5" />
                  Save Changes
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
                {isEditing ? 'Stop Editing' : 'Start Editing'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Toggle and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-high-contrast mb-4">View Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('official')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  viewMode === 'official'
                    ? 'bg-blue-500 text-white'
                    : 'glass border-white/20 text-readable hover:bg-white/10'
                }`}
              >
                <Eye className="h-4 w-4" />
                Official
              </button>
              <button
                onClick={() => setViewMode('custom')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  viewMode === 'custom'
                    ? 'bg-cyan-500 text-white'
                    : 'glass border-white/20 text-readable hover:bg-white/10'
                }`}
              >
                <EyeOff className="h-4 w-4" />
                My Custom
              </button>
            </div>
            <div className="mt-4 text-sm text-readable">
              {viewMode === 'official' 
                ? 'Viewing the official institutional timetable'
                : 'Viewing your personalized timetable'
              }
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass border-0 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-high-contrast mb-4">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-readable">Total Classes:</span>
                <span className="text-high-contrast font-semibold">
                  {Object.values(currentTimetable).reduce((total, day) => 
                    total + Object.values(day).filter(slot => slot && slot.type !== 'break').length, 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-readable">Free Periods:</span>
                <span className="text-high-contrast font-semibold">
                  {Object.values(currentTimetable).reduce((total, day) => 
                    total + Object.values(day).filter(slot => !slot || (slot.type === 'break' && slot.subject === 'Free Period')).length, 0
                  )}
                </span>
              </div>
              {viewMode === 'custom' && (
                <div className="flex justify-between">
                  <span className="text-readable">Custom Changes:</span>
                  <span className="text-cyan-400 font-semibold">
                    {Object.values(customTimetable).reduce((total, day) => 
                      total + Object.values(day).filter(slot => slot?.isCustom).length, 0
                    )}
                  </span>
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
              {viewMode === 'custom' && (
                <>
                  <button 
                    onClick={resetToOfficial}
                    className="w-full px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-all text-left text-orange-400"
                  >
                    <RefreshCw className="h-4 w-4 inline mr-2" />
                    Reset to Official
                  </button>
                  <button className="w-full px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all text-left text-green-400">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Export My Schedule
                  </button>
                </>
              )}
              <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-left text-blue-400">
                <BookOpen className="h-4 w-4 inline mr-2" />
                Study Planner
              </button>
            </div>
          </motion.div>
        </div>

        {/* Change Indicator */}
        {isEditing && hasChanges && viewMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg"
          >
            <p className="text-cyan-400 text-sm flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              You have unsaved changes to your custom timetable. Don't forget to save!
            </p>
          </motion.div>
        )}

        {/* Timetable Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass border-0 rounded-lg p-6"
        >
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold text-high-contrast">
              {viewMode === 'official' ? 'Official Timetable' : 'My Custom Timetable'}
            </h3>
            <div className="flex gap-2 text-sm text-readable">
              {isEditing && viewMode === 'custom' ? (
                <span>Drag classes to rearrange • Click + to add personal activities</span>
              ) : (
                <span>Read-only view</span>
              )}
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
                      const isPreferred = preferences.preferredTimeSlots.includes(timeSlot);
                      const isAvoided = preferences.avoidTimeSlots.includes(timeSlot);

                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className={`border border-gray-400 p-2 align-top min-h-[100px] ${
                            isPreferred ? 'bg-green-50' : isAvoided ? 'bg-red-50' : ''
                          }`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, timeSlot)}
                        >
                          {slot ? (
                            <div
                              className={`p-3 rounded border-2 relative group ${getSlotColor(slot.type, slot.isCustom)} ${
                                isEditing && viewMode === 'custom' && slot.type !== 'break' ? 'cursor-move' : ''
                              }`}
                              draggable={isEditing && viewMode === 'custom' && slot.type !== 'break'}
                              onDragStart={(e) => handleDragStart(e, day, timeSlot, slot)}
                            >
                              {slot.isCustom && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
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
                              {slot.students > 1 && (
                                <div className="text-xs">
                                  👥 {slot.students} students
                                </div>
                              )}

                              {/* Action buttons for custom view */}
                              {isEditing && viewMode === 'custom' && slot.isCustom && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => removeCustomActivity(day, timeSlot)}
                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`h-20 border-2 border-dashed rounded flex items-center justify-center transition-colors ${
                                isEditing && viewMode === 'custom'
                                  ? 'border-gray-300 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 cursor-pointer'
                                  : 'border-gray-200 text-gray-300'
                              }`}
                              onClick={() => isEditing && viewMode === 'custom' && openActivityModal(day, timeSlot)}
                            >
                              {isEditing && viewMode === 'custom' ? (
                                <>
                                  <Plus className="h-6 w-6" />
                                  <span className="ml-2 text-sm">Add Activity</span>
                                </>
                              ) : (
                                <span className="text-sm">Free</span>
                              )}
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
              <div className="w-4 h-4 bg-teal-100 border-2 border-teal-300 rounded"></div>
              <span className="text-sm text-readable">Tutorial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
              <span className="text-sm text-readable">Break</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-sm text-readable">Custom Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-sm text-readable">Preferred Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-sm text-readable">Avoid Time</span>
            </div>
          </div>
        </motion.div>

        {/* Personal Preferences Panel */}
        {viewMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 glass border-0 rounded-lg p-6"
          >
            <h3 className="text-xl font-bold text-high-contrast mb-6">Personal Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-high-contrast mb-3">Time Preferences</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-readable mb-2">
                      Preferred Time Slots
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => {
                            const newPreferred = preferences.preferredTimeSlots.includes(slot)
                              ? preferences.preferredTimeSlots.filter(s => s !== slot)
                              : [...preferences.preferredTimeSlots, slot];
                            setPreferences({...preferences, preferredTimeSlots: newPreferred});
                          }}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            preferences.preferredTimeSlots.includes(slot)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-readable mb-2">
                      Time Slots to Avoid
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => {
                            const newAvoided = preferences.avoidTimeSlots.includes(slot)
                              ? preferences.avoidTimeSlots.filter(s => s !== slot)
                              : [...preferences.avoidTimeSlots, slot];
                            setPreferences({...preferences, avoidTimeSlots: newAvoided});
                          }}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            preferences.avoidTimeSlots.includes(slot)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-high-contrast mb-3">Notes & Goals</h4>
                <textarea
                  value={preferences.notes}
                  onChange={(e) => setPreferences({...preferences, notes: e.target.value})}
                  className="w-full h-32 px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                  placeholder="Add your study goals, preferences, or any notes about your schedule..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Personal Activity Modal */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">Add Personal Activity</h2>
                <p className="text-cyan-100">
                  {selectedSlot && `${selectedSlot.day} at ${selectedSlot.timeSlot}`}
                </p>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Choose from your activities:
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {personalActivities.map(activity => (
                      <button
                        key={activity.id}
                        onClick={() => addPersonalActivity(activity)}
                        className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-cyan-400 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {activity.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {activity.description}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activity.type === 'study' ? 'bg-blue-100 text-blue-800' :
                                activity.type === 'exercise' ? 'bg-green-100 text-green-800' :
                                activity.type === 'work' ? 'bg-yellow-100 text-yellow-800' :
                                activity.type === 'hobby' ? 'bg-teal-100 text-teal-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {activity.duration} min
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {activity.priority}
                              </span>
                            </div>
                          </div>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: activity.color }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Or create a new activity:
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Activity title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const title = (e.target as HTMLInputElement).value;
                          if (title.trim()) {
                            createNewActivity(title, '', 'study');
                          }
                        }
                      }}
                    />
                    <div className="flex space-x-2">
                      {(['study', 'exercise', 'work', 'hobby', 'personal'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            const titleInput = document.querySelector('input[placeholder="Activity title"]') as HTMLInputElement;
                            const title = titleInput?.value.trim();
                            if (title) {
                              createNewActivity(title, '', type);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            type === 'study' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                            type === 'exercise' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            type === 'work' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                            type === 'hobby' ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' :
                            'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowActivityModal(false);
                    setSelectedSlot(null);
                  }}
                  className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
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
