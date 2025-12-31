import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { progressAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Brain, 
  Code, 
  MessageCircle, 
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    progressAPI.getDashboard
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const dashboard = dashboardData?.data;

  const quickActions = [
    {
      name: 'Chat with AI Tutor',
      description: 'Get help with any topic',
      href: '/chat',
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      name: 'Study Plan',
      description: 'View your personalized plan',
      href: '/study-plan',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      name: 'Take Quiz',
      description: 'Test your knowledge',
      href: '/quiz',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      name: 'Practice Coding',
      description: 'Solve programming problems',
      href: '/coding',
      icon: Code,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to continue your {user?.fieldOfStudy.replace('_', ' ').toLowerCase()} journey?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.stats?.totalQuizzes || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Code className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Code Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.stats?.totalSubmissions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.stats?.activePlans || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Study Plan Progress */}
      {dashboard?.studyPlanProgress?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Plan Progress</h2>
          <div className="space-y-4">
            {dashboard.studyPlanProgress.map((plan: any) => (
              <div key={plan.planId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{plan.title}</h3>
                  <span className="text-sm text-gray-600">
                    {plan.completedTasks}/{plan.totalTasks} tasks
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${plan.progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round(plan.progressPercentage)}% complete
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quizzes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quizzes</h2>
          {dashboard?.recentActivity?.quizzes?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentActivity.quizzes.map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{attempt.quiz.title}</p>
                    <p className="text-sm text-gray-600">{attempt.quiz.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{Math.round(attempt.score)}%</p>
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No quizzes taken yet</p>
          )}
        </div>

        {/* Recent Code Submissions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Code Submissions</h2>
          {dashboard?.recentActivity?.codeSubmissions?.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recentActivity.codeSubmissions.map((submission: any) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{submission.problem.title}</p>
                    <p className="text-sm text-gray-600">{submission.problem.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'ACCEPTED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No code submissions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;