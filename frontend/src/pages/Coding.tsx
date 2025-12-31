import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { codingAPI } from '../services/api';
import { Code, Play, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Coding: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('PYTHON');
  const queryClient = useQueryClient();

  const { data: problemsData, isLoading, error: problemsError } = useQuery(
    'codingProblems', 
    codingAPI.getProblems,
    {
      retry: 3,
      onError: (error: any) => {
        console.error('Failed to fetch coding problems:', error);
        toast.error('Failed to load coding problems');
      }
    }
  );
  const problems = problemsData?.data || [];

  const { data: submissionsData, error: submissionsError } = useQuery(
    'codeSubmissions', 
    codingAPI.getSubmissions,
    {
      retry: 3,
      onError: (error: any) => {
        console.error('Failed to fetch submissions:', error);
      }
    }
  );
  const submissions = submissionsData?.data || [];

  const submitCodeMutation = useMutation(codingAPI.submit, {
    onSuccess: (data) => {
      toast.success(`Code submitted! Status: ${data.data.status}`);
      setCode('');
      // Refresh submissions
      queryClient.invalidateQueries('codeSubmissions');
    },
    onError: (error: any) => {
      console.error('Code submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit code');
    }
  });

  // Set default code template when language changes
  useEffect(() => {
    if (selectedProblem && code === '') {
      const templates = {
        PYTHON: '# Write your Python solution here\ndef solution():\n    pass',
        JAVA: '// Write your Java solution here\npublic class Solution {\n    public void solution() {\n        \n    }\n}',
        JAVASCRIPT: '// Write your JavaScript solution here\nfunction solution() {\n    \n}',
        CPP: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}'
      };
      setCode(templates[language as keyof typeof templates] || '');
    }
  }, [language, selectedProblem]);

  const languages = [
    { value: 'PYTHON', label: 'Python' },
    { value: 'JAVA', label: 'Java' },
    { value: 'JAVASCRIPT', label: 'JavaScript' },
    { value: 'CPP', label: 'C++' }
  ];

  const handleSubmitCode = () => {
    if (!selectedProblem) {
      toast.error('Please select a problem first');
      return;
    }
    if (!code.trim()) {
      toast.error('Please write some code');
      return;
    }

    submitCodeMutation.mutate({
      problemId: selectedProblem.id,
      code: code.trim(),
      language
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-green-600';
      case 'WRONG_ANSWER': return 'text-red-600';
      case 'TIME_LIMIT_EXCEEDED': return 'text-yellow-600';
      case 'RUNTIME_ERROR': return 'text-orange-600';
      case 'COMPILATION_ERROR': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coding problems...</p>
        </div>
      </div>
    );
  }

  if (problemsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Problems</h3>
          <p className="text-gray-600 mb-4">There was an error loading the coding problems.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      {/* Problems List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Coding Problems</h2>
        
        {problems.length === 0 ? (
          <div className="text-center py-8">
            <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No coding problems available</p>
            <p className="text-sm text-gray-400">Problems will appear here once they're loaded</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {problems.map((problem: any) => (
              <div
                key={problem.id}
                onClick={() => {
                  setSelectedProblem(problem);
                  setCode(''); // Reset code when selecting new problem
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProblem?.id === problem.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{problem.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {problem.description.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Code className="w-3 h-3 mr-1" />
                    {problem.language}
                  </div>
                  {selectedProblem?.id === problem.id && (
                    <span className="text-primary-600 font-medium">Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Submissions */}
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Submissions</h3>
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-sm">No submissions yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissions.slice(0, 5).map((submission: any) => (
                <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900">
                      {submission.problem.title}
                    </p>
                    <span className={`text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="lg:col-span-2 flex flex-col">
        {selectedProblem ? (
          <>
            {/* Problem Description */}
            <div className="card mb-4">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedProblem.title}</h2>
                <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(selectedProblem.difficulty)}`}>
                  {selectedProblem.difficulty}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProblem.description}</p>
              </div>
              
              {/* Test Cases */}
              {selectedProblem.testCases && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Example Test Cases:</h4>
                  <div className="space-y-2">
                    {selectedProblem.testCases.slice(0, 2).map((testCase: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-700">Input:</span>
                            <pre className="mt-1 text-gray-900">{testCase.input}</pre>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expected Output:</span>
                            <pre className="mt-1 text-gray-900">{testCase.expectedOutput}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div className="card flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Solution</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-field w-32"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setCode('')}
                    className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded border border-gray-300 hover:border-gray-400"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write your ${language.toLowerCase()} code here...`}
                  className="flex-1 input-field font-mono text-sm resize-none min-h-64 leading-relaxed"
                  style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                />
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Language: {languages.find(l => l.value === language)?.label}</span>
                    <span>•</span>
                    <span>Lines: {code.split('\n').length}</span>
                    <span>•</span>
                    <span>Characters: {code.length}</span>
                  </div>
                  <button
                    onClick={handleSubmitCode}
                    disabled={submitCodeMutation.isLoading || !code.trim() || !selectedProblem}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitCodeMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Submit Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="max-w-md">
              <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Problem to Start</h3>
              <p className="text-gray-600 mb-4">
                Choose a coding problem from the list on the left to start solving. 
                You can write your solution in multiple programming languages.
              </p>
              <div className="text-sm text-gray-500">
                <p>💡 Tips:</p>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• Read the problem description carefully</li>
                  <li>• Check the example test cases</li>
                  <li>• Write clean, readable code</li>
                  <li>• Test your solution before submitting</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coding;