"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Trash2, Edit3, Save, Building2, BookOpen, Users, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  name: string;
  code: string;
  totalStudents: number;
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

export default function SetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [institutionName, setInstitutionName] = useState('');
  const [numBranches, setNumBranches] = useState(3);
  const [numSubjectsPerBranch, setNumSubjectsPerBranch] = useState(5);
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const steps = [
    { id: 1, title: 'Institution Setup', description: 'Basic information about your institution' },
    { id: 2, title: 'Branch Configuration', description: 'Set up your academic branches' },
    { id: 3, title: 'Subject Management', description: 'Configure subjects for each branch' },
    { id: 4, title: 'Teacher Assignment', description: 'Add teachers and assign subjects' },
    { id: 5, title: 'Review & Complete', description: 'Review your setup and finish' }
  ];

  // Initialize branches when numBranches changes
  const initializeBranches = () => {
    const newBranches: Branch[] = [];
    for (let i = 0; i < numBranches; i++) {
      newBranches.push({
        id: `branch-${i + 1}`,
        name: '',
        code: '',
        totalStudents: 60
      });
    }
    setBranches(newBranches);
  };

  // Initialize subjects when branches or numSubjectsPerBranch changes
  const initializeSubjects = () => {
    const newSubjects: Subject[] = [];
    branches.forEach(branch => {
      for (let i = 0; i < numSubjectsPerBranch; i++) {
        newSubjects.push({
          id: `${branch.id}-subject-${i + 1}`,
          name: '',
          code: '',
          type: 'theory',
          hoursPerWeek: 3,
          branchId: branch.id
        });
      }
    });
    setSubjects(newSubjects);
  };

  const addBranch = () => {
    const newBranch: Branch = {
      id: `branch-${branches.length + 1}`,
      name: '',
      code: '',
      totalStudents: 60
    };
    setBranches([...branches, newBranch]);
    setNumBranches(branches.length + 1);
  };

  const removeBranch = (branchId: string) => {
    setBranches(branches.filter(b => b.id !== branchId));
    setSubjects(subjects.filter(s => s.branchId !== branchId));
    setTeachers(teachers.map(t => ({
      ...t,
      branchIds: t.branchIds.filter(id => id !== branchId)
    })));
    setNumBranches(branches.length - 1);
  };

  const updateBranch = (branchId: string, field: keyof Branch, value: any) => {
    setBranches(branches.map(b => 
      b.id === branchId ? { ...b, [field]: value } : b
    ));
  };

  const addSubject = (branchId: string) => {
    const branchSubjects = subjects.filter(s => s.branchId === branchId);
    const newSubject: Subject = {
      id: `${branchId}-subject-${branchSubjects.length + 1}`,
      name: '',
      code: '',
      type: 'theory',
      hoursPerWeek: 3,
      branchId
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    setTeachers(teachers.map(t => ({
      ...t,
      subjects: t.subjects.filter(id => id !== subjectId)
    })));
  };

  const updateSubject = (subjectId: string, field: keyof Subject, value: any) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, [field]: value } : s
    ));
  };

  const addTeacher = () => {
    const newTeacher: Teacher = {
      id: `teacher-${teachers.length + 1}`,
      name: '',
      email: '',
      subjects: [],
      maxHoursPerDay: 6,
      branchIds: []
    };
    setTeachers([...teachers, newTeacher]);
  };

  const removeTeacher = (teacherId: string) => {
    setTeachers(teachers.filter(t => t.id !== teacherId));
  };

  const updateTeacher = (teacherId: string, field: keyof Teacher, value: any) => {
    setTeachers(teachers.map(t => 
      t.id === teacherId ? { ...t, [field]: value } : t
    ));
  };

  const nextStep = () => {
    if (currentStep === 1 && branches.length === 0) {
      initializeBranches();
    }
    if (currentStep === 2 && subjects.length === 0) {
      initializeSubjects();
    }
    setCurrentStep(Math.min(currentStep + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const completeSetup = () => {
    // Save setup data to localStorage or send to backend
    const setupData = {
      institutionName,
      branches,
      subjects,
      teachers,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('institutionSetup', JSON.stringify(setupData));
    
    // Redirect to admin dashboard
    router.push('/dashboard/admin');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-readable mb-2">
                Institution Name
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your institution name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-readable mb-2">
                  How many branches does your institution have?
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numBranches}
                  onChange={(e) => setNumBranches(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-readable mb-2">
                  How many subjects per branch?
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={numSubjectsPerBranch}
                  onChange={(e) => setNumSubjectsPerBranch(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Setup Preview</h4>
              <p className="text-readable text-sm">
                This will create <strong>{numBranches}</strong> branches with <strong>{numSubjectsPerBranch}</strong> subjects each, 
                for a total of <strong>{numBranches * numSubjectsPerBranch}</strong> subjects to configure.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-high-contrast">Configure Your Branches</h3>
              <button
                onClick={addBranch}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Branch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass border-0 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-high-contrast">
                      Branch {index + 1}
                    </h4>
                    {branches.length > 1 && (
                      <button
                        onClick={() => removeBranch(branch.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-readable mb-2">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={branch.name}
                        onChange={(e) => updateBranch(branch.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-readable mb-2">
                        Branch Code
                      </label>
                      <input
                        type="text"
                        value={branch.code}
                        onChange={(e) => updateBranch(branch.id, 'code', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g., CS"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-readable mb-2">
                        Total Students
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={branch.totalStudents}
                        onChange={(e) => updateBranch(branch.id, 'totalStudents', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-high-contrast focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-high-contrast">Configure Subjects</h3>
            
            {branches.map((branch) => {
              const branchSubjects = subjects.filter(s => s.branchId === branch.id);
              return (
                <div key={branch.id} className="glass border-0 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-high-contrast">
                      {branch.name || `Branch ${branch.id}`} - Subjects
                    </h4>
                    <button
                      onClick={() => addSubject(branch.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm"
                    >
                      <Plus className="h-3 w-3" />
                      Add Subject
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branchSubjects.map((subject, index) => (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm text-readable">Subject {index + 1}</span>
                          <button
                            onClick={() => removeSubject(subject.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-high-contrast text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Subject name"
                          />
                          
                          <input
                            type="text"
                            value={subject.code}
                            onChange={(e) => updateSubject(subject.id, 'code', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-high-contrast text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Subject code"
                            maxLength={8}
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={subject.type}
                              onChange={(e) => updateSubject(subject.id, 'type', e.target.value)}
                              className="px-2 py-1 bg-white/10 border border-white/20 rounded text-high-contrast text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="theory">Theory</option>
                              <option value="practical">Practical</option>
                              <option value="tutorial">Tutorial</option>
                            </select>

                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={subject.hoursPerWeek}
                              onChange={(e) => updateSubject(subject.id, 'hoursPerWeek', parseInt(e.target.value) || 1)}
                              className="px-2 py-1 bg-white/10 border border-white/20 rounded text-high-contrast text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="Hours/week"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return <div>Step content for step {currentStep}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-high-contrast mb-4">
            🎓 Institution Setup Wizard
          </h1>
          <p className="text-xl text-readable">
            Let's set up your academic institution step by step
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-400 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-high-contrast">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-readable">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass border-0 rounded-lg p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 glass border border-white/20 text-readable rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !institutionName}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={completeSetup}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
            >
              <Save className="h-5 w-5" />
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
