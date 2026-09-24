-- Seed standard problems
INSERT INTO public.problems (id, slug, title, description, difficulty, topics) VALUES
  (gen_random_uuid(), 'two-sum', 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.', 'Easy', ARRAY['Array', 'Hash Table']),
  (gen_random_uuid(), 'valid-parentheses', 'Valid Parentheses', 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and in the correct order.', 'Easy', ARRAY['String', 'Stack']),
  (gen_random_uuid(), 'merge-intervals', 'Merge Intervals', 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.', 'Medium', ARRAY['Array', 'Sorting']),
  (gen_random_uuid(), 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Given a string s, find the length of the longest substring without repeating characters. For example, the longest substring without repeating letters for "abcabcbb" is "abc", which the length is 3.', 'Medium', ARRAY['Hash Table', 'String', 'Sliding Window']),
  (gen_random_uuid(), 'binary-search', 'Binary Search', 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.', 'Easy', ARRAY['Array', 'Binary Search']),
  (gen_random_uuid(), 'climbing-stairs', 'Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', 'Easy', ARRAY['Math', 'Dynamic Programming', 'Memoization']),
  (gen_random_uuid(), 'word-break', 'Word Break', 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation.', 'Medium', ARRAY['Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization']),
  (gen_random_uuid(), 'coin-change', 'Coin Change', 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.', 'Medium', ARRAY['Array', 'Dynamic Programming', 'Breadth-First Search']),
  (gen_random_uuid(), 'lru-cache', 'LRU Cache', 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(int capacity) Initialize the LRU cache with positive size capacity. int get(int key) Return the value of the key if the key exists, otherwise return -1.', 'Medium', ARRAY['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List']),
  (gen_random_uuid(), 'trapping-rain-water', 'Trapping Rain Water', 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.', 'Hard', ARRAY['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'])
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title, description = EXCLUDED.description, difficulty = EXCLUDED.difficulty, topics = EXCLUDED.topics;

-- Provide generic level 0 templates for all newly inserted problems
INSERT INTO public.problem_levels (problem_id, language, level, template_code)
SELECT id, 'python', 0, '
import sys
if __name__ == "__main__":
    # TODO: Read input from sys.stdin and print output
    pass
' 
FROM public.problems 
ON CONFLICT (problem_id, language, level) DO NOTHING;
