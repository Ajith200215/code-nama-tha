import { createClient } from '@/lib/supabase/server';
import ProblemWorkspace from '@/components/problem-workspace';
import Shell from '@/components/shell';
import { notFound } from 'next/navigation';

export default async function CustomProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: problem } = await supabase
    .from('custom_problems')
    .select('*')
    .eq('id', id)
    .single();

  if (!problem) {
    return notFound();
  }

  // Parse the JSON description field
  let parsedDesc = { description: '', examples: [], constraints: [], difficulty: 'Medium', topics: [], test_cases: [] };
  try {
    parsedDesc = JSON.parse(problem.description);
  } catch (_e) {
    console.error("Failed to parse custom problem description");
  }

  // Build the full markdown description from the AI payload
  let fullDescription = parsedDesc.description + '\n\n';
  
  if (parsedDesc.examples && parsedDesc.examples.length > 0) {
    parsedDesc.examples.forEach((ex: { input: string, output: string, explanation?: string }, i: number) => {
      fullDescription += `**Example ${i+1}:**\nInput: ${ex.input}\nOutput: ${ex.output}\n${ex.explanation ? `Explanation: ${ex.explanation}` : ''}\n\n`;
    });
  }
  
  if (parsedDesc.constraints && parsedDesc.constraints.length > 0) {
    fullDescription += `**Constraints:**\n` + parsedDesc.constraints.map((c: string) => `- ${c}`).join('\n');
  }

  const problemData = {
    id: problem.id,
    title: problem.title,
    description: fullDescription.trim(),
    difficulty: parsedDesc.difficulty || 'Medium',
    topics: parsedDesc.topics || [],
  };

  const testCasesData = (parsedDesc.test_cases || []).map((tc: { input: string, expected_output: string }) => ({
    input: tc.input,
    expected_output: tc.expected_output,
    is_hidden: false
  }));

  const template_code = `# Read from stdin and print to stdout
import sys

def solve():
    # Read all lines from standard input
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    
    # TODO: Process input and print the result
    pass

if __name__ == '__main__':
    solve()
`;

  const levelsData = [
    {
      level: 3,
      language: 'python',
      template_code: template_code,
      hints: ['Read the constraints carefully to avoid performance issues.', 'Start by processing the input strings from stdin properly.'],
    },
    {
      level: 2,
      language: 'python',
      template_code: template_code,
      hints: ['Look closely at the examples to understand how edge cases are formatted.'],
    },
    {
      level: 1,
      language: 'python',
      template_code: template_code,
      hints: ['Consider a more optimal algorithm. Can you do it in fewer passes?'],
    },
    {
      level: 0,
      language: 'python',
      template_code: problem.reference_solution || template_code,
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
