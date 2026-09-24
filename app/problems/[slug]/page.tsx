import { createClient } from '@/lib/supabase/server';
import ProblemWorkspace from '@/components/problem-workspace';
import Shell from '@/components/shell';

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Try to fetch the problem from DB
  const { data: problem } = await supabase
    .from('problems')
    .select('*')
    .eq('slug', slug)
    .single();

  const MOCK_PROBLEMS = [
    { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topics: ['Array', 'Hash Table'] },
    { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', topics: ['String', 'Stack'] },
    { slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', topics: ['Array', 'Sorting'] },
    { slug: 'longest-substring', title: 'Longest Substring Without Repeating', difficulty: 'Medium', topics: ['String', 'Sliding Window'] },
    { slug: 'binary-search', title: 'Binary Search', difficulty: 'Easy', topics: ['Array', 'Binary Search'] },
    { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topics: ['DP', 'Math'] },
    { slug: 'word-break', title: 'Word Break', difficulty: 'Medium', topics: ['DP', 'String'] },
    { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium', topics: ['DP', 'Array'] },
    { slug: 'lru-cache', title: 'LRU Cache', difficulty: 'Medium', topics: ['Hash Table', 'Linked List'] },
    { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', topics: ['Array', 'Two Pointers'] },
  ];

  const mockProblem = MOCK_PROBLEMS.find(p => p.slug === slug);
  
  if (!problem && !mockProblem) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center h-full text-[var(--d-muted)]">
          <h1 className="text-2xl font-bold mb-2 text-[var(--d-ink)]">Problem Not Found</h1>
          <p>The problem you are looking for does not exist.</p>
        </div>
      </Shell>
    );
  }

  // If not found in DB, use the matched mock problem
  const problemData = problem || {
    id: 'mock-uuid',
    slug: slug,
    title: mockProblem!.title,
    description: slug === 'two-sum' 
      ? 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.'
      : `This is a placeholder description for **${mockProblem!.title}**. The database has not been fully seeded with this problem's content yet.`,
    difficulty: mockProblem!.difficulty,
    topics: mockProblem!.topics,
  };

  // Fetch test cases
  const { data: testCases } = await supabase
    .from('test_cases')
    .select('*')
    .eq('problem_id', problemData.id);

  const testCasesData = testCases?.length ? testCases : [
    { input: '[2,7,11,15]\n9', expected_output: '[0, 1]', is_hidden: false },
    { input: '[3,2,4]\n6', expected_output: '[1, 2]', is_hidden: false },
    { input: '[3,3]\n6', expected_output: '[0, 1]', is_hidden: true },
  ];

  // Fetch problem levels (templates and hints)
  const { data: levels } = await supabase
    .from('problem_levels')
    .select('*')
    .eq('problem_id', problemData.id);

  const twoSumRunner = `
import sys, json
if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(json.dumps(two_sum(nums, target)))
`;

  const genericRunner = `
import sys
if __name__ == '__main__':
    # TODO: Read input from sys.stdin and print output
    pass
`;

  const levelsData = levels?.length ? levels : [
    {
      level: 3,
      language: 'python',
      template_code: slug === 'two-sum' ? 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i] # <- your turn\n        seen[n] = i\n' + twoSumRunner : `# Mock L3 for ${slug}\n${genericRunner}`,
      hints: ['Fill in the missing line to return the correct indices.'],
    },
    {
      level: 2,
      language: 'python',
      template_code: slug === 'two-sum' ? 'def two_sum(nums, target):\n    seen = {}\n    # Loop through nums\n    # Check if target - n is in seen\n    # Return indices\n' + twoSumRunner : `# Mock L2 for ${slug}\n${genericRunner}`,
      hints: ['Use a hash map to keep track of numbers you have seen.'],
    },
    {
      level: 1,
      language: 'python',
      template_code: slug === 'two-sum' ? 'def two_sum(nums, target):\n    # Write your code here\n    pass\n' + twoSumRunner : `# Mock L1 for ${slug}\n${genericRunner}`,
      hints: ['A brute force solution is O(n^2). Can you do it in O(n) using a hash map?'],
    },
    {
      level: 0,
      language: 'python',
      template_code: slug === 'two-sum' ? twoSumRunner : genericRunner,
      hints: [],
    }
  ];

  return (
    <Shell>
      <ProblemWorkspace 
        problem={problemData} 
        testCases={testCasesData} 
        levels={levelsData} 
      />
    </Shell>
  );
}
