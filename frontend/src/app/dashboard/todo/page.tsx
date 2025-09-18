'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Calendar,
  Clock,
  Tag,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export default function TodoPage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [newTodo, setNewTodo] = useState<{
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    category: string
    dueDate: string
  }>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'General',
    dueDate: ''
  })

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos)
      setTodos(parsedTodos)
      setFilteredTodos(parsedTodos)
    }
  }, [])

  // Filter todos based on search and filters
  useEffect(() => {
    let filtered = todos

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filterPriority)
    }

    // Status filter
    if (filterStatus === 'completed') {
      filtered = filtered.filter(todo => todo.completed)
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(todo => !todo.completed)
    }

    setFilteredTodos(filtered)
  }, [todos, searchQuery, filterPriority, filterStatus])

  const saveTodos = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos)
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
  }

  const addTodo = () => {
    if (!newTodo.title.trim()) {
      toast.error('Please enter a todo title')
      return
    }

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category,
      dueDate: newTodo.dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedTodos = [todo, ...todos]
    saveTodos(updatedTodos)
    setShowAddModal(false)
    setNewTodo({
      title: '',
      description: '',
      priority: 'medium',
      category: 'General',
      dueDate: ''
    })
    toast.success('Todo added successfully!')
  }

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
        : todo
    )
    saveTodos(updatedTodos)
    toast.success('Todo updated!')
  }

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)
    saveTodos(updatedTodos)
    toast.success('Todo deleted!')
  }

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setNewTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate || ''
    })
    setShowAddModal(true)
  }

  const updateTodo = () => {
    if (!editingTodo || !newTodo.title.trim()) {
      toast.error('Please enter a todo title')
      return
    }

    const updatedTodos = todos.map(todo =>
      todo.id === editingTodo.id
        ? {
            ...todo,
            title: newTodo.title,
            description: newTodo.description,
            priority: newTodo.priority,
            category: newTodo.category,
            dueDate: newTodo.dueDate || undefined,
            updatedAt: new Date().toISOString()
          }
        : todo
    )

    saveTodos(updatedTodos)
    setShowAddModal(false)
    setEditingTodo(null)
    setNewTodo({
      title: '',
      description: '',
      priority: 'medium',
      category: 'General',
      dueDate: ''
    })
    toast.success('Todo updated successfully!')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const pendingCount = todos.filter(todo => !todo.completed).length

  return (
    <div className="min-h-screen bg-neutral-950/90">
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
              <h1 className="text-heading-1">📝 Todo List</h1>
              <p className="text-body text-muted">
                {pendingCount} pending, {completedCount} completed
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Todo</span>
          </button>
        </div>

        {/* Filters and Search */}
  <div className="glass-card p-6 mb-8 bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <div className="text-body-small text-muted flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredTodos.length} of {todos.length} todos
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-heading-3 mb-2">No todos found</h3>
              <p className="text-body text-muted mb-6">
                {todos.length === 0 
                  ? "Start by adding your first todo item"
                  : "Try adjusting your search or filters"
                }
              </p>
              {todos.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg"
                >
                  Add Your First Todo
                </button>
              )}
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-6 ${todo.completed ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-1 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-heading-3 ${todo.completed ? 'line-through text-muted' : ''}`}>
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`text-body mt-2 ${todo.completed ? 'line-through text-muted' : 'text-secondary'}`}>
                            {todo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => startEdit(todo)}
                          className="text-muted hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                        {todo.priority.toUpperCase()}
                      </span>
                      
                      <span className="flex items-center text-body-small text-muted">
                        <Tag className="w-3 h-3 mr-1" />
                        {todo.category}
                      </span>

                      {todo.dueDate && (
                        <span className="flex items-center text-body-small text-muted">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      <span className="flex items-center text-body-small text-muted">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(todo.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
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
            className="glass-card p-6 w-full max-w-md"
          >
            <h2 className="text-heading-2 mb-6">
              {editingTodo ? 'Edit Todo' : 'Add New Todo'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-body-small text-muted mb-2">Title *</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter todo title"
                />
              </div>

              <div>
                <label className="block text-body-small text-muted mb-2">Description</label>
                <textarea
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-small text-muted mb-2">Priority</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-body-small text-muted mb-2">Category</label>
                  <input
                    type="text"
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                    className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="General"
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-small text-muted mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="w-full px-4 py-3 glass-card border-0 rounded-lg text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingTodo(null)
                  setNewTodo({
                    title: '',
                    description: '',
                    priority: 'medium',
                    category: 'General',
                    dueDate: ''
                  })
                }}
                className="flex-1 px-4 py-2 glass-button"
              >
                Cancel
              </button>
              <button
                onClick={editingTodo ? updateTodo : addTodo}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {editingTodo ? 'Update' : 'Add'} Todo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
