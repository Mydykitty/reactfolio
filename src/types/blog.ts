/**
 * 分类接口
 * 对应数据库中的 categories 表
 */
export interface Category {
  id: number;              // 分类唯一ID，主键
  name: string;            // 分类名称（如：技术、生活、笔记）
  slug: string;            // URL友好的唯一标识（如：tech、life）
  description?: string;    // 分类描述（可选）
  post_count: number;      // 该分类下的文章数量
}

/**
 * 文章接口
 * 对应数据库中的 posts 表
 */
export interface Post {
  id: number;              // 文章唯一ID，主键
  title: string;           // 文章标题
  slug: string;            // URL友好的唯一标识（如：my-first-post）
  content: string;         // 文章内容（Markdown格式）
  excerpt?: string;        // 文章摘要（可选，不提供则自动截取内容）
  cover_image?: string;    // 封面图片URL地址（可选）
  category?: Category;     // 所属分类信息（关联categories表）
  tags: string[];          // 文章标签数组（如：['React', 'TypeScript']）
  view_count: number;      // 浏览次数
  like_count: number;      // 点赞次数
  comment_count: number;   // 评论次数
  published_at: string;    // 实际发布时间（ISO格式时间字符串）
  created_at: string;      // 创建时间（ISO格式时间字符串）
  author?: {               // 作者信息（可选，关联auth.users表）
    name: string;          // 作者名称（从user_metadata中获取）
    avatar?: string;       // 作者头像URL（可选）
  };
}

/**
 * 文章评论接口
 * 对应数据库中的 post_comments 表
 */
export interface PostComment {
  id: number;              // 评论唯一ID，主键
  post_id: number;         // 所属文章ID，关联posts表
  user_id: string;         // 评论用户ID，关联auth.users表
  content: string;         // 评论内容
  likes_count: number;     // 评论点赞数
  created_at: string;      // 评论时间（ISO格式时间字符串）
  user?: {                 // 用户信息（可选，关联auth.users表）
    name: string;          // 用户名称（从user_metadata中获取）
    avatar?: string;       // 用户头像URL（可选）
  };
}