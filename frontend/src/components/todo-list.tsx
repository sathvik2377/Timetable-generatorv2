"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, X, Edit2, Trash2, Calendar, Clock, Flag } from 'lucide-react'

interface TodoItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
}

interface TodoListProps {
  className?: string
}

export function TodoList({ className = '' }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('dashboard-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('dashboard-todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!newTodo.trim()) return

    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.trim(),
      description: newDescription.trim() || undefined,
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString()
    }

    setTodos(prev => [todo, ...prev])
    setNewTodo('')
    setNewDescription('')
    setNewPriority('medium')
    setNewDueDate('')
    setIsAddingTodo(false)
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const updateTodo = (id: string, updates: Partial<TodoItem>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ))
    setEditingId(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400'
      case 'medium': return 'text-yellow-400 border-yellow-400'
      case 'low': return 'text-blue-400 border-blue-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const completedCount = todos.filter(todo => todo.completed).length
  const activeCount = todos.filter(todo => !todo.completed).length

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">To-Do List</h3>
          <p className="text-sm text-muted">
            {activeCount} active, {completedCount} completed
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingTodo(true)}
          className="glass-button p-2 rounded-lg"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-4 bg-white/5 rounded-lg p-1">
        {(['all', 'active', 'completed'] as const).map((filterType) => (
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

      {/* Add Todo Form */}
      <AnimatePresence>
        {isAddingTodo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 glass border rounded-lg"
          >
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full mb-3 p-2 glass border rounded-lg text-primary placeholder-muted"
              autoFocus
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full mb-3 p-2 glass border rounded-lg text-primary placeholder-muted resize-none"
              rows={2}
            />
            <div className="flex gap-3 mb-3">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="flex-1 p-2 glass border rounded-lg text-primary"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="flex-1 p-2 glass border rounded-lg text-primary"
              />
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTodo}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Add Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingTodo(false)}
                className="px-4 py-2 glass-button rounded-lg"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-3 glass border rounded-lg transition-all ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-gray-400 hover:border-purple-400'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3 text-white" />}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${
                      todo.completed ? 'line-through text-muted' : 'text-primary'
                    }`}>
                      {todo.title}
                    </h4>
                    <Flag className={`w-3 h-3 ${getPriorityColor(todo.priority)}`} />
                  </div>
                  
                  {todo.description && (
                    <p className={`text-sm mb-2 ${
                      todo.completed ? 'line-through text-muted' : 'text-secondary'
                    }`}>
                      {todo.description}
                    </p>
                  )}
                  
                  {todo.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingId(todo.id)}
                    className="p-1 text-muted hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTodos.length === 0 && (
        <div className="text-center py-8 text-muted">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>
            {filter === 'completed' 
              ? 'No completed tasks yet' 
              : filter === 'active' 
              ? 'No active tasks' 
              : 'No tasks yet. Add one above!'}
          </p>
        </div>
      )}
    </div>
  )
}
