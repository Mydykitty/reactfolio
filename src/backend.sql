-- =====================================================
-- 留言板系统表结构
-- =====================================================

-- 创建留言表
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),           -- 用户ID
    user_name TEXT,                                    -- 用户名（GitHub用户名）
    avatar_url TEXT,                                   -- 头像URL
    is_pinned BOOLEAN DEFAULT FALSE                    -- 是否置顶
);

-- 创建索引以提高查询性能
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(desc);
CREATE INDEX idx_messages_is_pinned ON messages(is_pinned DESC);

-- 设置留言表行级安全策略
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 创建留言表访问策略
CREATE POLICY "所有人可查看留言" 
    ON messages FOR SELECT 
    USING (true);

CREATE POLICY "仅登录用户可发布留言" 
    ON messages FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "用户可更新自己的留言" 
    ON messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的留言" 
    ON messages FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 博客系统表结构
-- =====================================================

-- 1. 分类表
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,              -- 分类名称
    slug VARCHAR(50) UNIQUE NOT NULL,              -- URL友好的分类标识
    description VARCHAR(200),                       -- 分类描述
    post_count INTEGER DEFAULT 0,                   -- 文章数量
    created_at TIMESTAMP DEFAULT NOW()              -- 创建时间
);

-- 2. 文章表
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,                    -- 文章标题
    slug VARCHAR(200) UNIQUE NOT NULL,              -- URL友好的唯一标识
    content TEXT NOT NULL,                           -- 文章内容（Markdown）
    excerpt VARCHAR(300),                            -- 文章摘要
    cover_image VARCHAR(500),                        -- 封面图片URL
    category_id BIGINT REFERENCES categories(id),    -- 所属分类
    tags TEXT[],                                     -- 文章标签数组
    view_count INTEGER DEFAULT 0,                    -- 浏览次数
    like_count INTEGER DEFAULT 0,                    -- 点赞次数
    comment_count INTEGER DEFAULT 0,                 -- 评论次数
    is_published BOOLEAN DEFAULT false,              -- 是否已发布
    published_at TIMESTAMP,                           -- 实际发布时间
    created_at TIMESTAMP DEFAULT NOW(),               -- 创建时间
    updated_at TIMESTAMP DEFAULT NOW(),               -- 更新时间
    user_id UUID REFERENCES auth.users(id)           -- 作者ID
);

-- 3. 文章评论表
CREATE TABLE post_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,  -- 所属文章
    user_id UUID REFERENCES auth.users(id),                  -- 评论用户ID
    content TEXT NOT NULL,                                   -- 评论内容
    likes_count INTEGER DEFAULT 0,                           -- 评论点赞数
    created_at TIMESTAMP DEFAULT NOW()                       -- 评论时间
);

-- 4. 文章点赞表
CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,  -- 被点赞的文章
    user_id UUID REFERENCES auth.users(id),                  -- 点赞用户
    created_at TIMESTAMP DEFAULT NOW(),                      -- 点赞时间
    UNIQUE(post_id, user_id)                                 -- 防止重复点赞
);

-- 创建博客表相关索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);

-- 设置博客表行级安全策略
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 创建博客表访问策略
CREATE POLICY "所有人可查看分类" ON categories FOR SELECT USING (true);
CREATE POLICY "仅管理员可管理分类" ON categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "所有人可查看已发布文章" ON posts FOR SELECT 
    USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "仅作者可管理文章" ON posts FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "作者可更新自己的文章" ON posts FOR UPDATE 
    USING (auth.uid() = user_id);
CREATE POLICY "作者可删除自己的文章" ON posts FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "所有人可查看评论" ON post_comments FOR SELECT USING (true);
CREATE POLICY "登录用户可评论" ON post_comments FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "用户可更新自己的评论" ON post_comments FOR UPDATE 
    USING (auth.uid() = user_id);
CREATE POLICY "用户可删除自己的评论" ON post_comments FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "登录用户可点赞" ON post_likes FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "用户可取消自己的点赞" ON post_likes FOR DELETE 
    USING (auth.uid() = user_id);