-- ClickUp Clone: Full Database Schema Migration from Prisma to Supabase

-- =====================================================
-- 1. PROFILES TABLE (replaces User model)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. WORKSPACE & MEMBERSHIP
-- =====================================================
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.workspace_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'GUEST');

CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'MEMBER',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspaces RLS
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
  ON public.workspaces FOR UPDATE
  USING (owner_id = auth.uid());

-- Workspace members RLS
CREATE POLICY "Users can view members of their workspaces"
  ON public.workspace_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. TAGS (workspace-level)
-- =====================================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tags in their workspaces"
  ON public.tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = tags.workspace_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. SPACES
-- =====================================================
CREATE TABLE public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view spaces in their workspaces"
  ON public.spaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create spaces in their workspaces"
  ON public.spaces FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update spaces in their workspaces"
  ON public.spaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = spaces.workspace_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. FOLDERS
-- =====================================================
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view folders in their workspaces"
  ON public.folders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = folders.space_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create folders in their workspaces"
  ON public.folders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = folders.space_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update folders in their workspaces"
  ON public.folders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE s.id = folders.space_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. LISTS
-- =====================================================
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT list_must_have_parent CHECK (space_id IS NOT NULL OR folder_id IS NOT NULL)
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lists in their workspaces"
  ON public.lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE (s.id = lists.space_id OR s.id = (SELECT f.space_id FROM public.folders f WHERE f.id = lists.folder_id))
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lists in their workspaces"
  ON public.lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE (s.id = lists.space_id OR s.id = (SELECT f.space_id FROM public.folders f WHERE f.id = lists.folder_id))
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lists in their workspaces"
  ON public.lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE (s.id = lists.space_id OR s.id = (SELECT f.space_id FROM public.folders f WHERE f.id = lists.folder_id))
        AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. STATUSES (for Spaces and Lists)
-- =====================================================
CREATE TABLE public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL DEFAULT 'active',
  "order" INT NOT NULL DEFAULT 0,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE
);

ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view statuses in their workspaces"
  ON public.statuses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spaces s
      JOIN public.workspace_members wm ON wm.workspace_id = s.workspace_id
      WHERE (s.id = statuses.space_id OR s.id = (
        SELECT sp.id FROM public.lists l
        LEFT JOIN public.spaces sp ON sp.id = l.space_id
        LEFT JOIN public.folders f ON f.id = l.folder_id
        LEFT JOIN public.spaces sp2 ON sp2.id = f.space_id
        WHERE l.id = statuses.list_id
        LIMIT 1
      ))
        AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. TASKS
-- =====================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  due_date TIMESTAMPTZ,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their workspaces"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = tasks.list_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their workspaces"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = tasks.list_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their workspaces"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = tasks.list_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their workspaces"
  ON public.tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = tasks.list_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 9. TASK ASSIGNEES
-- =====================================================
CREATE TABLE public.task_assignees (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignees in their workspaces"
  ON public.task_assignees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = task_assignees.task_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 10. TASK TAGS (many-to-many)
-- =====================================================
CREATE TABLE public.task_tags (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view task tags in their workspaces"
  ON public.task_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = task_tags.task_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 11. COMMENTS
-- =====================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their workspaces"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = comments.task_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments in their workspaces"
  ON public.comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = comments.task_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 12. CUSTOM FIELDS
-- =====================================================
CREATE TYPE public.custom_field_type AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'CHECKBOX', 'CURRENCY', 'RATING');

CREATE TABLE public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type custom_field_type NOT NULL,
  options JSONB,
  currency TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  pinned BOOLEAN NOT NULL DEFAULT false,
  hide_empty BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'all',
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view custom fields in their workspaces"
  ON public.custom_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = custom_fields.list_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create custom fields in their workspaces"
  ON public.custom_fields FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = custom_fields.list_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update custom fields in their workspaces"
  ON public.custom_fields FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = custom_fields.list_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete custom fields in their workspaces"
  ON public.custom_fields FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists l
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE l.id = custom_fields.list_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 13. CUSTOM FIELD VALUES
-- =====================================================
CREATE TABLE public.custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(task_id, field_id)
);

ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view custom field values in their workspaces"
  ON public.custom_field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = custom_field_values.task_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create custom field values in their workspaces"
  ON public.custom_field_values FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = custom_field_values.task_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update custom field values in their workspaces"
  ON public.custom_field_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = custom_field_values.task_id AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete custom field values in their workspaces"
  ON public.custom_field_values FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.lists l ON l.id = t.list_id
      LEFT JOIN public.spaces s ON s.id = l.space_id
      LEFT JOIN public.folders f ON f.id = l.folder_id
      LEFT JOIN public.spaces s2 ON s2.id = f.space_id
      JOIN public.workspace_members wm ON wm.workspace_id = COALESCE(s.workspace_id, s2.workspace_id)
      WHERE t.id = custom_field_values.task_id AND wm.user_id = auth.uid()
    )
  );

-- =====================================================
-- 14. UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lists FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.custom_fields FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.custom_field_values FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 15. INDEXES for Performance
-- =====================================================
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_tags_workspace_id ON public.tags(workspace_id);
CREATE INDEX idx_spaces_workspace_id ON public.spaces(workspace_id);
CREATE INDEX idx_folders_space_id ON public.folders(space_id);
CREATE INDEX idx_lists_space_id ON public.lists(space_id);
CREATE INDEX idx_lists_folder_id ON public.lists(folder_id);
CREATE INDEX idx_statuses_space_id ON public.statuses(space_id);
CREATE INDEX idx_statuses_list_id ON public.statuses(list_id);
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_id);
CREATE INDEX idx_task_assignees_task_id ON public.task_assignees(task_id);
CREATE INDEX idx_task_assignees_user_id ON public.task_assignees(user_id);
CREATE INDEX idx_task_tags_task_id ON public.task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON public.task_tags(tag_id);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_custom_fields_list_id ON public.custom_fields(list_id);
CREATE INDEX idx_custom_fields_created_by ON public.custom_fields(created_by);
CREATE INDEX idx_custom_field_values_task_id ON public.custom_field_values(task_id);
CREATE INDEX idx_custom_field_values_field_id ON public.custom_field_values(field_id);