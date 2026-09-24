-- Create tables

-- 1. profiles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. problems
CREATE TABLE public.problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. test_cases
CREATE TABLE public.test_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. problem_levels
CREATE TABLE public.problem_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 3),
    template_code TEXT NOT NULL,
    hidden_answers JSONB,
    hints TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(problem_id, language, level)
);

-- 5. submissions
CREATE TABLE public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL,
    execution_time NUMERIC,
    memory NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. level_progress
CREATE TABLE public.level_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 3),
    passed BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, problem_id, level)
);

-- 7. rooms
CREATE TABLE public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. room_members
CREATE TABLE public.room_members (
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(room_id, user_id)
);

-- 9. room_problems
CREATE TABLE public.room_problems (
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    PRIMARY KEY(room_id, problem_id)
);

-- 10. room_scores
CREATE TABLE public.room_scores (
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(room_id, user_id)
);

-- 11. custom_problems
CREATE TABLE public.custom_problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reference_solution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ai_cache
CREATE TABLE public.ai_cache (
    hash TEXT PRIMARY KEY,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ai_usage
CREATE TABLE public.ai_usage (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    calls_count INTEGER DEFAULT 0,
    PRIMARY KEY(user_id, date)
);


-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Profiles: read all, update own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Problems, Problem Levels: read all
CREATE POLICY "Problems are viewable by everyone." ON public.problems FOR SELECT USING (true);
CREATE POLICY "Problem levels are viewable by everyone." ON public.problem_levels FOR SELECT USING (true);

-- Test Cases: only read non-hidden test cases
CREATE POLICY "Non-hidden test cases are viewable by everyone." ON public.test_cases FOR SELECT USING (is_hidden = false);

-- Submissions, Level Progress, Custom Problems, AI Usage: read/write own
CREATE POLICY "Users can read own submissions." ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions." ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own progress." ON public.level_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress." ON public.level_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read/write own custom problems." ON public.custom_problems FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read/write own ai usage." ON public.ai_usage FOR ALL USING (auth.uid() = user_id);

-- Rooms: members can read, creator can update
CREATE POLICY "Room members can see the room." ON public.rooms FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.room_members WHERE room_id = id)
  OR auth.uid() = created_by
);
CREATE POLICY "Users can create rooms." ON public.rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room members can read members." ON public.room_members FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.room_members WHERE room_id = room_members.room_id)
);
CREATE POLICY "Users can join rooms." ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Room members can read room problems." ON public.room_problems FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.room_members WHERE room_id = room_problems.room_id)
);

CREATE POLICY "Room members can read room scores." ON public.room_scores FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.room_members WHERE room_id = room_scores.room_id)
);
CREATE POLICY "Members can update their own room scores." ON public.room_scores FOR ALL USING (auth.uid() = user_id);
