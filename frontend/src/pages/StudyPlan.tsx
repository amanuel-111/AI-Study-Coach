import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studyPlanAPI } from '../services/api';
import { BookOpen, Clock, CheckCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const StudyPlan: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    duration: 7,
    hoursPerDay: 2
  });
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery('studyPlans', studyPlanAPI.getPlans);
  const plans = plansData?.data || [];

  const createPlanMutation = useMutation(studyPlanAPI.generate, {
    onSuccess: () => {
      queryClient.invalidateQueries('studyPlans');
      setShowCreateForm(false);
      setFormData({ subject: '', duration: 7, hoursPerDay: 2 });
      toast.success('Study plan created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create study plan');
    }
  });

  const completeTaskMutation = useMutation(studyPlanAPI.completeTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('studyPlans');
      toast.success('Task completed!');
    }
  });

  const subjects = [
    { value: 'PROGRAMMING_PYTHON', label: 'Python Programming' },
    { value: 'PROGRAMMING_JAVA', label: 'Java Programming' },
    { value: 'PROGRAMMING_JAVASCRIPT', label: 'JavaScript Programming' },
    { value: 'DATA_STRUCTURES', label: 'Data Structures' },
    { value: 'ALGORITHMS', label: 'Algorithms' },
    { value: 'DATABASES', label: 'Databases' },
    { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlanMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Plans</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Create Plan Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Study Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours per day
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={formData.hoursPerDay}
                  onChange={(e) => setFormData({ ...formData, hoursPerDay: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createPlanMutation.isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {createPlanMutation.isLoading ? 'Creating...' : 'Create Plan'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Study Plans List */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No study plans yet</h3>
          <p className="text-gray-600 mb-4">Create your first personalized study plan to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan: any) => {
            const completedTasks = plan.tasks.filter((task: any) => task.isCompleted).length;
            const totalTasks = plan.tasks.length;
            const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div key={plan.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {plan.subject.replace('_', ' ')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {completedTasks}/{totalTasks} tasks
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {plan.tasks.slice(0, 5).map((task: any) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        task.isCompleted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => !task.isCompleted && completeTaskMutation.mutate(task.id)}
                          disabled={task.isCompleted || completeTaskMutation.isLoading}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            task.isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {task.isCompleted && <CheckCircle className="w-3 h-3" />}
                        </button>
                        <div>
                          <p className={`font-medium ${
                            task.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </p>
                          <p className={`text-sm ${
                            task.isCompleted ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {task.estimatedMinutes} min
                      </div>
                    </div>
                  ))}
                  
                  {plan.tasks.length > 5 && (
                    <div className="text-center text-sm text-gray-500">
                      +{plan.tasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudyPlan;