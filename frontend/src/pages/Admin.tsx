import React from 'react';
import { useQuery } from 'react-query';
import { progressAPI } from '../services/api';
import { Users, BookOpen, Brain, Code, TrendingUp } from 'lucide-react';

const Admin: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery(
    'adminDashboard',
    progressAPI.getDashboard
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard 👨‍💼</h1>
        <p className="text-purple-100">
          System overview and management panel
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Plans</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Code className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Code Submissions</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <Code className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Coding Problems</h3>
                <p className="text-sm text-gray-600">Add and manage coding challenges</p>
              </div>
            </div>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">View system analytics and reports</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Database Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="text-gray-900">MySQL (MAMP)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port:</span>
                <span className="text-gray-900">3306</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">AI Service Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="text-gray-900">OpenAI GPT-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-yellow-600 font-medium">Configure API Key</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;