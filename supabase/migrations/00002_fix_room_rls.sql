-- Fix infinite recursion in room_members RLS policy
-- The original policy was checking room_members from within room_members, causing infinite recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Room members can see the room." ON public.rooms;
DROP POLICY IF EXISTS "Room members can read members." ON public.room_members;
DROP POLICY IF EXISTS "Room members can read room problems." ON public.room_problems;
DROP POLICY IF EXISTS "Room members can read room scores." ON public.room_scores;

-- Recreate rooms policy: use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = p_room_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- rooms: creator or member can see
CREATE POLICY "Room members can see the room." ON public.rooms
  FOR SELECT USING (
    auth.uid() = created_by
    OR public.is_room_member(id)
  );

-- room_members: members can read via the security definer function  
CREATE POLICY "Room members can read members." ON public.room_members
  FOR SELECT USING (
    public.is_room_member(room_id)
  );

-- room_problems
CREATE POLICY "Room members can read room problems." ON public.room_problems
  FOR SELECT USING (
    public.is_room_member(room_id)
  );

-- room_scores
CREATE POLICY "Room members can read room scores." ON public.room_scores
  FOR SELECT USING (
    public.is_room_member(room_id)
  );
