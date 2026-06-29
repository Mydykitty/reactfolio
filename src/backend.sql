-- =====================================================
-- 1. 创建 profiles 表
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
                                               id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 2. 创建 messages 表（关键步骤）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
                                               id BIGSERIAL PRIMARY KEY,
                                               name TEXT NOT NULL,
                                               content TEXT NOT NULL,
                                               created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0
    );

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON messages(is_pinned DESC);

-- 开启 RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "所有人可查看留言" ON public.messages;
CREATE POLICY "所有人可查看留言" ON public.messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "仅登录用户可发布留言" ON public.messages;
CREATE POLICY "仅登录用户可发布留言" ON public.messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "用户可更新自己的留言" ON public.messages;
CREATE POLICY "用户可更新自己的留言" ON public.messages
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可删除自己的留言" ON public.messages;
CREATE POLICY "用户可删除自己的留言" ON public.messages
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. 创建 message_likes 表
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_likes (
                                                    id BIGSERIAL PRIMARY KEY,
                                                    message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
    );

CREATE INDEX IF NOT EXISTS idx_message_likes_message ON message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_user ON message_likes(user_id);

ALTER TABLE public.message_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "所有人可查看点赞" ON public.message_likes;
CREATE POLICY "所有人可查看点赞" ON public.message_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "登录用户可点赞" ON public.message_likes;
CREATE POLICY "登录用户可点赞" ON public.message_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "用户可取消自己的点赞" ON public.message_likes;
CREATE POLICY "用户可取消自己的点赞" ON public.message_likes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. 创建点赞数自动更新触发器
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_message_likes ON public.message_likes;
DROP FUNCTION IF EXISTS public.update_message_likes_count() CASCADE;

CREATE OR REPLACE FUNCTION public.update_message_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
UPDATE messages
SET likes_count = likes_count + 1
WHERE id = NEW.message_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE messages
SET likes_count = GREATEST(0, likes_count - 1)
WHERE id = OLD.message_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_message_likes
    AFTER INSERT OR DELETE ON public.message_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_message_likes_count();

-- =====================================================
-- 5. 创建用户注册自动创建 profile 的触发器
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO public.profiles (id, username, full_name, avatar_url)
VALUES (
           NEW.id,
           COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username', NEW.email),
           COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name'),
           COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
       )
    ON CONFLICT (id) DO UPDATE
                            SET
                                username = EXCLUDED.username,
                            full_name = EXCLUDED.full_name,
                            avatar_url = EXCLUDED.avatar_url;

RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. 为当前用户创建 profile
-- =====================================================
INSERT INTO public.profiles (id, username, full_name, avatar_url)
VALUES (
           '92837332-7eb7-4875-9fb6-b8201c8d273d',
           'Mydykitty',
           'Mydykitty',
           'https://avatars.githubusercontent.com/u/5461820?v=4'
       )
    ON CONFLICT (id) DO UPDATE
                            SET
                                username = EXCLUDED.username,
                            full_name = EXCLUDED.full_name,
                            avatar_url = EXCLUDED.avatar_url;


-- =====================================================
-- 1. 创建 message_reactions 表（留言表情回复）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
                                                        id BIGSERIAL PRIMARY KEY,
                                                        message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,  -- 存储 👍 ❤️ 😂 等表情
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction)  -- 同一用户对同一留言只能有一种表情
    );

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);

-- 开启 RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "所有人可查看表情" ON public.message_reactions;
CREATE POLICY "所有人可查看表情" ON public.message_reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "登录用户可添加表情" ON public.message_reactions;
CREATE POLICY "登录用户可添加表情" ON public.message_reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "用户可删除自己的表情" ON public.message_reactions;
CREATE POLICY "用户可删除自己的表情" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- 1. 创建 categories 表（博客分类）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200),
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "所有人可查看分类" ON public.categories;
CREATE POLICY "所有人可查看分类" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "仅管理员可管理分类" ON public.categories;
CREATE POLICY "仅管理员可管理分类" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. 创建 posts 表（博客文章）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.posts (
                                            id BIGSERIAL PRIMARY KEY,
                                            title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(300),
    cover_image VARCHAR(500),
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
    );

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "所有人可查看已发布文章" ON public.posts;
CREATE POLICY "所有人可查看已发布文章" ON public.posts
    FOR SELECT USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "仅作者可管理文章" ON public.posts;
CREATE POLICY "仅作者可管理文章" ON public.posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "作者可更新自己的文章" ON public.posts;
CREATE POLICY "作者可更新自己的文章" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "作者可删除自己的文章" ON public.posts;
CREATE POLICY "作者可删除自己的文章" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. 创建 visit_logs 表（访问日志）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.visit_logs (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 path TEXT,
                                                 referer TEXT,
                                                 utm_source TEXT,
                                                 utm_medium TEXT,
                                                 utm_campaign TEXT,
                                                 utm_term TEXT,
                                                 utm_content TEXT,
                                                 visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_at ON visit_logs(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_logs_path ON visit_logs(path);

-- 开启 RLS（允许所有人写入，但不允许删除）
ALTER TABLE public.visit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "允许记录访问" ON public.visit_logs;
CREATE POLICY "允许记录访问" ON public.visit_logs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "仅管理员可查看日志" ON public.visit_logs;
CREATE POLICY "仅管理员可查看日志" ON public.visit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. 为当前用户创建 profile（如果还没有）
-- =====================================================
INSERT INTO public.profiles (id, username, full_name, avatar_url)
VALUES (
           '92837332-7eb7-4875-9fb6-b8201c8d273d',
           'Mydykitty',
           'Mydykitty',
           'https://avatars.githubusercontent.com/u/5461820?v=4'
       )
    ON CONFLICT (id) DO UPDATE
                            SET
                                username = EXCLUDED.username,
                            full_name = EXCLUDED.full_name,
                            avatar_url = EXCLUDED.avatar_url;


-- =====================================================
-- 创建 post_comments 表（文章评论）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_comments (
                                                    id BIGSERIAL PRIMARY KEY,
                                                    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at DESC);

-- 开启 RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
DROP POLICY IF EXISTS "所有人可查看评论" ON public.post_comments;
CREATE POLICY "所有人可查看评论" ON public.post_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "登录用户可评论" ON public.post_comments;
CREATE POLICY "登录用户可评论" ON public.post_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "用户可更新自己的评论" ON public.post_comments;
CREATE POLICY "用户可更新自己的评论" ON public.post_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "用户可删除自己的评论" ON public.post_comments;
CREATE POLICY "用户可删除自己的评论" ON public.post_comments
    FOR DELETE USING (auth.uid() = user_id);