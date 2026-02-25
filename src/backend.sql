-- =====================================================
-- 博客系统数据库表结构
-- 适用于 Supabase (PostgreSQL)
-- =====================================================

-- =====================================================
-- 博客系统数据库表结构
-- 适用于 Supabase (PostgreSQL)
-- =====================================================

-- 1. 分类表 (categories)
-- 存储文章的分类信息
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,                    -- 分类唯一ID，自动递增
    name VARCHAR(50) UNIQUE NOT NULL,              -- 分类名称（如：技术、生活、笔记）
    slug VARCHAR(50) UNIQUE NOT NULL,              -- URL友好的分类标识（如：tech、life）
    description VARCHAR(200),                       -- 分类描述（可选）
    post_count INTEGER DEFAULT 0,                   -- 该分类下的文章数量，默认为0
    created_at TIMESTAMP DEFAULT NOW()              -- 创建时间，默认为当前时间
);

-- 2. 文章表 (posts)
-- 存储所有的博客文章内容
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,                    -- 文章唯一ID，自动递增
    title VARCHAR(200) NOT NULL,                  -- 文章标题，最多200字符
    slug VARCHAR(200) UNIQUE NOT NULL,            -- URL友好的唯一标识（如：my-first-post）
    content TEXT NOT NULL,                         -- 文章内容（Markdown格式）
    excerpt VARCHAR(300),                          -- 文章摘要，最多300字符
    cover_image VARCHAR(500),                      -- 封面图片URL地址
    category_id BIGINT REFERENCES categories(id),  -- 所属分类ID，关联categories表
    tags TEXT[],                                   -- 文章标签数组（如：{'React','TypeScript'}）
    view_count INTEGER DEFAULT 0,                   -- 浏览次数，默认为0
    like_count INTEGER DEFAULT 0,                   -- 点赞次数，默认为0
    comment_count INTEGER DEFAULT 0,                -- 评论次数，默认为0
    is_published BOOLEAN DEFAULT false,            -- 是否已发布，默认false（草稿状态）
    published_at TIMESTAMP,                         -- 实际发布时间（仅当is_published为true时有效）
    created_at TIMESTAMP DEFAULT NOW(),             -- 创建时间，默认为当前时间
    updated_at TIMESTAMP DEFAULT NOW(),             -- 最后更新时间，默认为当前时间
    user_id UUID REFERENCES auth.users(id)         -- 作者ID，关联Supabase内置的auth.users表
);

-- 3. 评论表 (post_comments)
-- 存储文章的评论内容
CREATE TABLE post_comments (
    id BIGSERIAL PRIMARY KEY,                    -- 评论唯一ID，自动递增
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,  -- 所属文章ID，关联posts表，文章删除时评论自动删除
    user_id UUID REFERENCES auth.users(id),       -- 评论用户ID，关联auth.users表
    content TEXT NOT NULL,                         -- 评论内容
    likes_count INTEGER DEFAULT 0,                   -- 评论点赞数，默认为0
    created_at TIMESTAMP DEFAULT NOW()              -- 评论时间，默认为当前时间
);

-- 4. 文章点赞表 (post_likes)
-- 记录用户对文章的点赞关系（多对多）
CREATE TABLE post_likes (
    id BIGSERIAL PRIMARY KEY,                    -- 点赞记录唯一ID，自动递增
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,  -- 被点赞的文章ID，关联posts表
    user_id UUID REFERENCES auth.users(id),       -- 点赞用户ID，关联auth.users表
    created_at TIMESTAMP DEFAULT NOW(),             -- 点赞时间，默认为当前时间
    UNIQUE(post_id, user_id)                       -- 联合唯一约束：同一用户不能重复点赞同一篇文章
);

-- =====================================================
-- 可选的：添加一些测试数据
-- =====================================================

INSERT INTO categories (name, slug, description) VALUES
    ('技术', 'tech', '编程开发相关文章'),
    ('生活', 'life', '生活感悟分享');

-- 创建文章（把下面的 user_id 改成你的）
INSERT INTO posts (title, slug, content, excerpt, category_id, tags, is_published, published_at, user_id) VALUES 
(
    '我的第一篇文章',
    'my-first-post',
    '# Hello World\n\n这是测试内容',
    '这是文章摘要',
    1,
    ARRAY['测试'],
    true,
    NOW(),
    'e9666489-05cc-40ce-86f4-e7d2597d987a'  -- ← 改成你的ID
);