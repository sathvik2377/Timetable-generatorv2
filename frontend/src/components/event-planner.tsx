"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, Clock, MapPin, Users, Edit2, Trash2, Bell } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  time: string
  location?: string
  attendees?: string
  type: 'meeting' | 'class' | 'exam' | 'deadline' | 'personal'
  reminder: boolean
  createdAt: string
}

interface EventPlannerProps {
  className?: string
}

export function EventPlanner({ className = '' }: EventPlannerProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    attendees: '',
    type: 'meeting' as Event['type'],
    reminder: true
  })
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('upcoming')

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('dashboard-events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-events', JSON.stringify(events))
  }, [events])

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time) return

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || undefined,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location.trim() || undefined,
      attendees: newEvent.attendees.trim() || undefined,
      type: newEvent.type,
      reminder: newEvent.reminder,
      createdAt: new Date().toISOString()
    }

    setEvents(prev => [...prev, event].sort((a, b) => 
      new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
    ))

    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      attendees: '',
      type: 'meeting',
      reminder: true
    })
    setIsAddingEvent(false)
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      case 'class': return 'bg-green-500/20 border-green-500/30 text-green-400'
      case 'exam': return 'bg-red-500/20 border-red-500/30 text-red-400'
      case 'deadline': return 'bg-orange-500/20 border-orange-500/30 text-orange-400'
      case 'personal': return 'bg-purple-500/20 border-purple-500/30 text-purple-400'
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400'
    }
  }

  const getFilteredEvents = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    return events.filter(event => {
      const eventDate = new Date(`${event.date} ${event.time}`)
      
      switch (filter) {
        case 'today':
          return event.date === today
        case 'upcoming':
          return eventDate >= now
        case 'past':
          return eventDate < now
        default:
          return true
      }
    })
  }

  const isEventSoon = (event: Event) => {
    const eventDateTime = new Date(`${event.date} ${event.time}`)
    const now = new Date()
    const diffHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 24
  }

  const filteredEvents = getFilteredEvents()
  const upcomingCount = events.filter(event => 
    new Date(`${event.date} ${event.time}`) >= new Date()
  ).length

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">Event Planner</h3>
          <p className="text-sm text-muted">
            {upcomingCount} upcoming events
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingEvent(true)}
          className="glass-button p-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-4 bg-white/5 rounded-lg p-1">
        {(['upcoming', 'today', 'all', 'past'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              filter === filterType
                ? 'bg-white/20 text-primary'
                : 'text-muted hover:text-primary hover:bg-white/10'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Event Form */}
      <AnimatePresence>
        {isAddingEvent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 glass border rounded-lg"
          >
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              className="w-full mb-3 p-2 glass border rounded-lg text-primary placeholder-muted"
              autoFocus
            />
            
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full mb-3 p-2 glass border rounded-lg text-primary placeholder-muted resize-none"
              rows={2}
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="p-2 glass border rounded-lg text-primary"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                className="p-2 glass border rounded-lg text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Location (optional)"
                className="p-2 glass border rounded-lg text-primary placeholder-muted"
              />
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                className="p-2 glass border rounded-lg text-primary"
              >
                <option value="meeting">Meeting</option>
                <option value="class">Class</option>
                <option value="exam">Exam</option>
                <option value="deadline">Deadline</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <input
              type="text"
              value={newEvent.attendees}
              onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: e.target.value }))}
              placeholder="Attendees (optional)"
              className="w-full mb-3 p-2 glass border rounded-lg text-primary placeholder-muted"
            />

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="reminder"
                checked={newEvent.reminder}
                onChange={(e) => setNewEvent(prev => ({ ...prev, reminder: e.target.checked }))}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <label htmlFor="reminder" className="text-sm text-secondary">
                Set reminder
              </label>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addEvent}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Add Event
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingEvent(false)}
                className="px-4 py-2 glass-button rounded-lg"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 glass border rounded-lg ${getEventTypeColor(event.type)} ${
                isEventSoon(event) ? 'ring-2 ring-yellow-400/50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-primary">{event.title}</h4>
                    {event.reminder && <Bell className="w-4 h-4 text-yellow-400" />}
                    {isEventSoon(event) && (
                      <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded-full">
                        Soon
                      </span>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-secondary mb-2">{event.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.attendees && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{event.attendees}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteEvent(event.id)}
                  className="p-1 text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-muted">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>
            {filter === 'today' 
              ? 'No events today' 
              : filter === 'upcoming' 
              ? 'No upcoming events' 
              : filter === 'past'
              ? 'No past events'
              : 'No events yet. Add one above!'}
          </p>
        </div>
      )}
    </div>
  )
}
