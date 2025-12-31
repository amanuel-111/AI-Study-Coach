import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from 'react-query';
import { authAPI } from '../services/api';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    fieldOfStudy: user?.fieldOfStudy || '',
    level: user?.level || ''
  });

  const updateProfileMutation = useMutation(authAPI.updateProfile, {
    onSuccess: () => {
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  });

  const studyFields = [
    { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
    { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
    { value: 'INFORMATION_TECHNOLOGY', label: 'Information Technology' },
    { value: 'INFORMATION_SYSTEMS', label: 'Information Systems' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity' }
  ];

  const levels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and learning preferences</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              className="input-field bg-gray-50"
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study
            </label>
            <select
              id="fieldOfStudy"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className="input-field"
              required
            >
              {studyFields.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Learning Level
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="input-field"
              required
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isLoading}
              className="btn-primary disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Member since:</span>
            <span className="text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current field:</span>
            <span className="text-gray-900">
              {studyFields.find(f => f.value === user?.fieldOfStudy)?.label || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Learning level:</span>
            <span className="text-gray-900">
              {levels.find(l => l.value === user?.level)?.label || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;