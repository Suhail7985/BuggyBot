export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';

export const APP_NAME = 'BuggyBot';
export const APP_TAGLINE = 'Professional AI tutor for data structures and algorithms';

export const DSA_TOPICS = [
  'Binary Search',
  'BFS',
  'DFS',
  'Dijkstra\'s Algorithm',
  'Dynamic Programming',
  'Recursion',
  'Arrays',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Hash Tables',
  'Sorting Algorithms',
  'Greedy Algorithms',
];

export const CHAT_MODES = {
  chat: { label: 'Chat', description: 'Concept explanations and problem solving' },
  quiz: { label: 'Quiz', description: 'Structured practice questions' },
  complexity: { label: 'Complexity', description: 'Big O and performance analysis' },
} as const;

export const EXAMPLE_QUESTIONS = [
  'Explain binary search: approach, complexity, and a Python implementation.',
  'Compare breadth-first and depth-first search for graphs.',
  'What is the time and space complexity of merge sort?',
  'How does Dijkstra\'s algorithm guarantee shortest paths on weighted graphs?',
  'Generate five quiz questions on dynamic programming.',
  'Walk through the two-pointer technique with an example.',
];
