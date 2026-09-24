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

  const refCode = parsedDesc.reference_solution || '';
  const refLines = refCode.split('\n');

  // Fallback generation for older problems that don't have native levels
  const l3Fallback = refLines.map((line: string, i: number) => {
    if (line.trim() === '') return line;
    if (i >= refLines.length * 0.8) return `${line.match(/^\\s*/)?.[0] || ''}# TODO: finish this line`;
    return `${line} # <understand this logic>`;
  }).join('\n');

  const l2Fallback = refLines.map((line: string, i: number) => {
    if (line.trim() === '') return line;
    if (i >= refLines.length * 0.4) return `${line.match(/^\\s*/)?.[0] || ''}# TODO: implement step ${i+1}`;
    return `${line} # <understand this logic>`;
  }).join('\n');

  const l1Fallback = refLines.map((line: string, i: number) => {
    if (line.trim() === '') return line;
    return `${line.match(/^\\s*/)?.[0] || ''}# Step ${i + 1}: implement logic here`;
  }).join('\n');

  const l0Fallback = `# Read from stdin and print to stdout\nimport sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n`;

  const fallbackLevels = [
    { level: 3, language: 'python', template_code: l3Fallback || l0Fallback, hints: ['Fill in the TODO blanks at the bottom.', 'Look at the commented code above for structure.'] },
    { level: 2, language: 'python', template_code: l2Fallback || l0Fallback, hints: ['You have the beginning structure. Now complete the core logic.'] },
    { level: 1, language: 'python', template_code: l1Fallback || l0Fallback, hints: ['Follow the step-by-step comments to write the algorithm from scratch.'] },
    { level: 0, language: 'python', template_code: refCode || l0Fallback, hints: [] }
  ];

  const levelsData = (parsedDesc.levels && parsedDesc.levels.length === 4) 
    ? parsedDesc.levels.map((l: { level: number, template_code: string, hints: string[] }) => ({
        level: l.level,
        language: 'python',
        template_code: l.template_code,
        hints: l.hints || []
      }))
    : fallbackLevels;

  return (
    <Shell>
      <ProblemWorkspace 
        problem={problemData} 
        testCases={testCasesData} 
        levels={levelsData} 
        isCustom={true}
      />
    </Shell>
  );
}
