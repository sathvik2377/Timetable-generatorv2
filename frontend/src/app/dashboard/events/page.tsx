'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  attendees: number
  category: 'meeting' | 'class' | 'exam' | 'event' | 'other'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    attendees: 0,
    category: 'meeting' as const,
    priority: 'medium' as const
  })

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('events')
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents)
      setEvents(parsedEvents)
      setFilteredEvents(parsedEvents)
    }
  }, [])

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory)
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })

    setFilteredEvents(filtered)
  }, [events, searchQuery, filterCategory])

  const saveEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
  }

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      attendees: newEvent.attendees,
      category: newEvent.category,
      priority: newEvent.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedEvents = [event, ...events]
    saveEvents(updatedEvents)
    setShowAddModal(false)
    resetForm()
    toast.success('Event added successfully!')
  }

  const updateEvent = () => {
    if (!editingEvent || !newEvent.title.trim() || !newEvent.date || !newEvent.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const updatedEvents = events.map(event =>
      event.id === editingEvent.id
        ? {
            ...event,
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date,
            time: newEvent.time,
            location: newEvent.location,
            attendees: newEvent.attendees,
            category: newEvent.category,
            priority: newEvent.priority,
            updatedAt: new Date().toISOString()
          }
        : event
    )

    saveEvents(updatedEvents)
    setShowAddModal(false)
    setEditingEvent(null)
    resetForm()
    toast.success('Event updated successfully!')
  }

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id)
    saveEvents(updatedEvents)
    toast.success('Event deleted!')
  }

  const startEdit = (event: Event) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      attendees: event.attendees,
      category: event.category,
      priority: event.priority
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      attendees: 0,
      category: 'meeting',
      priority: 'medium'
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting': return '🤝'
      case 'class': return '📚'
      case 'exam': return '📝'
      case 'event': return '🎉'
      default: return '📅'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
      case 'class': return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      case 'exam': return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'event': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const isEventToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    return date === today
  }

  const isEventUpcoming = (date: string, time: string) => {
    const eventDateTime = new Date(`${date} ${time}`)
    const now = new Date()
    return eventDateTime > now
  }

  const upcomingEvents = filteredEvents.filter(event => 
    isEventUpcoming(event.date, event.time)
  ).slice(0, 3)

  const todayEvents = filteredEvents.filter(event => isEventToday(event.date))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="glass-button flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-heading-1">📅 Event Planner</h1>
              <p className="text-body text-muted">
                {events.length} total events, {upcomingEvents.length} upcoming
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-muted hover:text-primary'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-muted hover:text-primary'
                }`}
              >
                Calendar
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-heading-3">{todayEvents.length}</h3>
                <p className="text-body-small text-muted">Today's Events</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-heading-3">{upcomingEvents.length}</h3>
                <p className="text-body-small text-muted">Upcoming Events</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-heading-3">
                  {events.reduce((sum, event) => sum + event.attendees, 0)}
                </h3>
                <p className="text-body-small text-muted">Total Attendees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="meeting">Meetings</option>
              <option value="class">Classes</option>
              <option value="exam">Exams</option>
              <option value="event">Events</option>
              <option value="other">Other</option>
            </select>

            <div className="text-body-small text-muted flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-heading-3 mb-2">No events found</h3>
              <p className="text-body text-muted mb-6">
                {events.length === 0 
                  ? "Start by adding your first event"
                  : "Try adjusting your search or filters"
                }
              </p>
              {events.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg"
                >
                  Add Your First Event
                </button>
              )}
            </div>
          ) : (
            filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-6 border-l-4 ${getPriorityColor(event.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(event.category)}</span>
                      <h3 className="text-heading-3">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {event.category.toUpperCase()}
                      </span>
                      {isEventToday(event.date) && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                          TODAY
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-body text-secondary mb-4">{event.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-small text-muted">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.attendees > 0 && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => startEdit(event)}
                      className="text-muted hover:text-primary transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-heading-2 mb-6">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-body-small text-muted mb-2">Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-body-small text-muted mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-small text-muted mb-2">Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-body-small text-muted mb-2">Time *</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted mb-2">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter location (optional)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-body-small text-muted mb-2">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="class">Class</option>
                    <option value="exam">Exam</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-small text-muted mb-2">Priority</label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value as any })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-small text-muted mb-2">Attendees</label>
                  <input
                    type="number"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({ ...newEvent, attendees: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingEvent(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 glass-button"
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? updateEvent : addEvent}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {editingEvent ? 'Update' : 'Add'} Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
