-- Insert test cases for seeded problems
INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '2 7 11 15\n9', '0 1', false FROM public.problems WHERE slug = 'two-sum';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '3 2 4\n6', '1 2', false FROM public.problems WHERE slug = 'two-sum';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '()', 'true', false FROM public.problems WHERE slug = 'valid-parentheses';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '()[]{}', 'true', false FROM public.problems WHERE slug = 'valid-parentheses';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '(]', 'false', false FROM public.problems WHERE slug = 'valid-parentheses';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '[[1,3],[2,6],[8,10],[15,18]]', '[[1,6],[8,10],[15,18]]', false FROM public.problems WHERE slug = 'merge-intervals';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, 'abcabcbb', '3', false FROM public.problems WHERE slug = 'longest-substring-without-repeating-characters';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '[-1,0,3,5,9,12]\n9', '4', false FROM public.problems WHERE slug = 'binary-search';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '2', '2', false FROM public.problems WHERE slug = 'climbing-stairs';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, 'leetcode\n["leet","code"]', 'true', false FROM public.problems WHERE slug = 'word-break';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '[1,2,5]\n11', '3', false FROM public.problems WHERE slug = 'coin-change';

INSERT INTO public.test_cases (problem_id, input, expected_output, is_hidden)
SELECT id, '[0,1,0,2,1,0,1,3,2,1,2,1]', '6', false FROM public.problems WHERE slug = 'trapping-rain-water';
