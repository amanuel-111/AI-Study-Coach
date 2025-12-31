import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { quizAPI } from '../services/api';
import { Brain, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Quiz: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const { data: historyData } = useQuery('quizHistory', quizAPI.getHistory);
  const history = historyData?.data || [];

  const generateQuizMutation = useMutation(quizAPI.generate, {
    onSuccess: (data) => {
      setCurrentQuiz(data.data);
      setAnswers({});
      setShowResults(false);
      setResults(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate quiz');
    }
  });

  const submitQuizMutation = useMutation(quizAPI.submit, {
    onSuccess: (data) => {
      setResults(data.data);
      setShowResults(true);
      toast.success(`Quiz completed! Score: ${Math.round(data.data.score)}%`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit quiz');
    }
  });

  const subjects = [
    { value: 'PROGRAMMING_PYTHON', label: 'Python Programming' },
    { value: 'PROGRAMMING_JAVA', label: 'Java Programming' },
    { value: 'DATA_STRUCTURES', label: 'Data Structures' },
    { value: 'ALGORITHMS', label: 'Algorithms' },
    { value: 'DATABASES', label: 'Databases' },
    { value: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity' }
  ];

  const handleGenerateQuiz = (subject: string) => {
    generateQuizMutation.mutate({ subject, questionCount: 5 });
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length < currentQuiz.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    submitQuizMutation.mutate({
      quizId: currentQuiz.id,
      answers
    });
  };

  const startNewQuiz = () => {
    setCurrentQuiz(null);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-xl text-gray-600">
            You scored {Math.round(results.score)}% ({results.correctAnswers}/{results.totalQuestions} correct)
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Your Answers</h2>
          <div className="space-y-6">
            {results.results.map((result: any, index: number) => (
              <div key={result.questionId} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {index + 1}. {result.question}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Your answer:</span>{' '}
                        <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {result.userAnswer}
                        </span>
                      </p>
                      {!result.isCorrect && (
                        <p>
                          <span className="font-medium">Correct answer:</span>{' '}
                          <span className="text-green-600">{result.correctAnswer}</span>
                        </p>
                      )}
                      <p className="text-gray-600 mt-2">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={startNewQuiz} className="btn-primary">
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (currentQuiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{currentQuiz.title}</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{currentQuiz.questions.length} questions</span>
            </div>
          </div>

          <div className="space-y-8">
            {currentQuiz.questions.map((question: any, index: number) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {index + 1}. {question.question}
                </h3>

                {question.type === 'multiple_choice' ? (
                  <div className="space-y-2">
                    {question.options.map((option: string, optionIndex: number) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optionIndex}
                          checked={answers[question.id] === optionIndex}
                          onChange={() => handleAnswerChange(question.id, optionIndex)}
                          className="text-primary-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer..."
                    className="input-field h-24 resize-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button onClick={startNewQuiz} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitQuizMutation.isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {submitQuizMutation.isLoading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Quiz Practice</h1>

      {/* Generate New Quiz */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Start a New Quiz</h2>
        <p className="text-gray-600 mb-4">
          Choose a subject to generate a personalized quiz based on your learning level.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((subject) => (
            <button
              key={subject.value}
              onClick={() => handleGenerateQuiz(subject.value)}
              disabled={generateQuizMutation.isLoading}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-primary-600" />
                <span className="font-medium text-gray-900">{subject.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Results</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No quiz attempts yet. Take your first quiz above!
          </p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((attempt: any) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{attempt.quiz.title}</p>
                  <p className="text-sm text-gray-600">
                    {attempt.quiz.subject.replace('_', ' ')} • {attempt.quiz.difficulty}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    attempt.score >= 80 ? 'text-green-600' :
                    attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(attempt.score)}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {attempt.score >= 80 ? 'Excellent' :
                     attempt.score >= 60 ? 'Good' : 'Needs Work'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;