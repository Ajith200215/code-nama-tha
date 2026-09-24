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

  // If not found in DB, use a mock problem (for development without DB populated)
  const problemData = problem || {
    id: 'mock-uuid',
    slug: slug,
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
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

  const runnerCode = `
import sys, json
if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        print(json.dumps(two_sum(nums, target)))
`;

  const levelsData = levels?.length ? levels : [
    {
      level: 3,
      language: 'python',
      template_code: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i] # <- your turn\n        seen[n] = i\n' + runnerCode,
      hints: ['Fill in the missing line to return the correct indices.'],
    },
    {
      level: 2,
      language: 'python',
      template_code: 'def two_sum(nums, target):\n    seen = {}\n    # Loop through nums\n    # Check if target - n is in seen\n    # Return indices\n' + runnerCode,
      hints: ['Use a hash map to keep track of numbers you have seen.'],
    },
    {
      level: 1,
      language: 'python',
      template_code: 'def two_sum(nums, target):\n    # Write your code here\n    pass\n' + runnerCode,
      hints: ['A brute force solution is O(n^2). Can you do it in O(n) using a hash map?'],
    },
    {
      level: 0,
      language: 'python',
      template_code: runnerCode,
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
