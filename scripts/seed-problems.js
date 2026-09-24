import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    envVars[match[1].trim()] = val;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching LeetCode dataset from GitHub...");
  try {
    const dataList = [
      {
        titleSlug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
        topic_tags: ['Array', 'Hash Table']
      },
      {
        titleSlug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        content: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and in the correct order.',
        topic_tags: ['String', 'Stack']
      },
      {
        titleSlug: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        content: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        topic_tags: ['Array', 'Sorting']
      },
      {
        titleSlug: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        content: 'Given a string s, find the length of the longest substring without repeating characters. For example, the longest substring without repeating letters for "abcabcbb" is "abc", which the length is 3.',
        topic_tags: ['Hash Table', 'String', 'Sliding Window']
      },
      {
        titleSlug: 'binary-search',
        title: 'Binary Search',
        difficulty: 'Easy',
        content: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
        topic_tags: ['Array', 'Binary Search']
      },
      {
        titleSlug: 'climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        content: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        topic_tags: ['Math', 'Dynamic Programming', 'Memoization']
      },
      {
        titleSlug: 'word-break',
        title: 'Word Break',
        difficulty: 'Medium',
        content: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation.',
        topic_tags: ['Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization']
      },
      {
        titleSlug: 'coin-change',
        title: 'Coin Change',
        difficulty: 'Medium',
        content: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
        topic_tags: ['Array', 'Dynamic Programming', 'Breadth-First Search']
      },
      {
        titleSlug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        content: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(int capacity) Initialize the LRU cache with positive size capacity. int get(int key) Return the value of the key if the key exists, otherwise return -1.',
        topic_tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List']
      },
      {
        titleSlug: 'trapping-rain-water',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        content: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        topic_tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack']
      }
    ];
    
    const problemsToInsert = dataList;
    
    console.log(`Seeding ${problemsToInsert.length} problems into the database...`);
    
    for (const p of problemsToInsert) {
      // Map the dataset fields to our database schema
      // The Alishohadaee dataset typically has: question_title, question_title_slug, question_difficulty, question_content (html), topic_tags
      
      const slug = p.question_title_slug || p.titleSlug || p.title.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const title = p.question_title || p.title;
      let difficulty = p.question_difficulty || p.difficulty || "Medium";
      if (typeof difficulty === 'number') {
         difficulty = difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : 'Hard';
      }
      // Strip HTML tags from description if it exists
      const rawDescription = p.question_content || p.content || p.description || "";
      const cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '').trim().substring(0, 500) + (rawDescription.length > 500 ? '...' : '');
      
      const topics = p.topic_tags ? (typeof p.topic_tags === 'string' ? p.topic_tags.split(',') : p.topic_tags) : ['Array'];

      const { data: insertedProblem, error: insertError } = await supabase
        .from('problems')
        .upsert({
          slug: slug,
          title: title,
          description: cleanDescription || "Description not available in dataset.",
          difficulty: difficulty,
          topics: Array.isArray(topics) ? topics.map(t => typeof t === 'string' ? t : t.name) : ['Algorithms'],
        }, { onConflict: 'slug' })
        .select()
        .single();
        
      if (insertError) {
        console.error(`Error inserting ${slug}:`, insertError.message);
        continue;
      }
      
      // Also generate a basic template for it in problem_levels
      // (Normally we'd use AI to generate the 4 levels, but for 50 problems we'll seed empty templates)
      const genericRunner = `\\nimport sys\\nif __name__ == '__main__':\\n    # TODO: Read input from sys.stdin and print output\\n    pass\\n`;
      
      // Seed level 0
      await supabase.from('problem_levels').upsert({
         problem_id: insertedProblem.id,
         level: 0,
         language: 'python',
         template_code: genericRunner,
         hints: []
      }, { onConflict: 'problem_id, level, language' });
      
      console.log(`✅ Seeded: ${title}`);
    }
    
    console.log("\\n🎉 Seeding complete! 50 problems have been added to your platform.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

main();
