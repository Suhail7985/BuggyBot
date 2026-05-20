export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';

export const APP_NAME = 'BuggyBot';
export const APP_TAGLINE = 'Your chaotic but genius DSA AI mentor';

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
  chat: { label: 'Chat', icon: '💬', description: 'Ask anything about DSA' },
  quiz: { label: 'Quiz Me', icon: '🧠', description: 'Generate MCQs and practice' },
  complexity: { label: 'Complexity', icon: '⚡', description: 'Analyze Big O notation' },
} as const;

export const EXAMPLE_QUESTIONS = [
  'What is binary search and how does it work?',
  'Explain BFS vs DFS with a real-world analogy',
  'What is the time complexity of quicksort?',
  'How does Dijkstra\'s algorithm find the shortest path?',
  'Can you quiz me on dynamic programming?',
  'Explain recursion like I\'m 10 years old',
];
