import prisma from '../config/database';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@studycoach.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@studycoach.com',
      password: adminPassword,
      fieldOfStudy: 'COMPUTER_SCIENCE',
      level: 'ADVANCED'
    }
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create sample student user
  const studentPassword = await bcrypt.hash('student123', 12);
  
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@example.com',
      password: studentPassword,
      fieldOfStudy: 'SOFTWARE_ENGINEERING',
      level: 'BEGINNER'
    }
  });

  console.log('✅ Created demo student user:', studentUser.email);

  // Create sample coding problems
  const codingProblems = [
    {
      title: 'Two Sum',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
      difficulty: 'BEGINNER',
      language: 'PYTHON',
      testCases: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          expectedOutput: '[0,1]',
          description: 'Basic case'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          expectedOutput: '[1,2]',
          description: 'Different indices'
        }
      ],
      solution: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`
    },
    {
      title: 'Reverse String',
      description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]`,
      difficulty: 'BEGINNER',
      language: 'PYTHON',
      testCases: [
        {
          input: 's = ["h","e","l","l","o"]',
          expectedOutput: '["o","l","l","e","h"]',
          description: 'Basic string reversal'
        }
      ],
      solution: `def reverse_string(s):
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1`
    },
    {
      title: 'Binary Search',
      description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

Example:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4`,
      difficulty: 'INTERMEDIATE',
      language: 'PYTHON',
      testCases: [
        {
          input: 'nums = [-1,0,3,5,9,12], target = 9',
          expectedOutput: '4',
          description: 'Target found'
        },
        {
          input: 'nums = [-1,0,3,5,9,12], target = 2',
          expectedOutput: '-1',
          description: 'Target not found'
        }
      ],
      solution: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
    }
  ];

  // Insert coding problems
  for (const problem of codingProblems) {
    await prisma.codingProblem.create({
      data: {
        ...problem,
        difficulty: problem.difficulty as any,
        language: problem.language as any
      }
    });
  }

  console.log('✅ Created coding problems');

  // Create sample quizzes
  const quizzes = [
    {
      title: 'Python Basics Quiz',
      subject: 'PROGRAMMING_PYTHON',
      difficulty: 'BEGINNER',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'Which of the following is the correct way to create a list in Python?',
          options: ['list = []', 'list = ()', 'list = {}', 'list = ""'],
          correctAnswer: 0,
          explanation: 'Square brackets [] are used to create lists in Python.'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'What is the output of print(type([]))?',
          options: ['<class \'tuple\'>', '<class \'list\'>', '<class \'dict\'>', '<class \'str\'>'],
          correctAnswer: 1,
          explanation: 'The type() function returns the class type of the object, and [] creates a list.'
        }
      ]
    },
    {
      title: 'Data Structures Fundamentals',
      subject: 'DATA_STRUCTURES',
      difficulty: 'INTERMEDIATE',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the time complexity of accessing an element in an array by index?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          correctAnswer: 0,
          explanation: 'Array access by index is constant time O(1) because we can directly calculate the memory address.'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Which data structure follows LIFO (Last In, First Out) principle?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
          correctAnswer: 1,
          explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.'
        }
      ]
    }
  ];

  // Insert quizzes
  for (const quiz of quizzes) {
    await prisma.quiz.create({
      data: {
        ...quiz,
        subject: quiz.subject as any,
        difficulty: quiz.difficulty as any
      }
    });
  }

  console.log('✅ Created sample quizzes');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });