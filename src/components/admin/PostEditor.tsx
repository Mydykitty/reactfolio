import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import type { Category } from "../../types/blog";

const PostEditor: React.FC = () => {
  const { id } = useParams(); // 如果有id表示编辑，没有就是新建
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载分类列表
  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  // 如果是编辑模式，加载文章数据
  const fetchPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt || "");
      setCategoryId(data.category_id);
      setTags(data.tags?.join(", ") || "");
      setIsPublished(data.is_published);
    }
    setLoading(false);
  };

  // 生成URL友好的slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // 保存文章
  const savePost = async () => {
    if (!title || !content) {
      alert("标题和内容不能为空");
      return;
    }

    setSaving(true);
    const slug = generateSlug(title);
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + "...",
      category_id: categoryId,
      tags: tagArray,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      user_id: user?.id,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (id) {
      // 更新文章
      ({ error } = await supabase.from("posts").update(postData).eq("id", id));
    } else {
      // 新建文章
      ({ error } = await supabase.from("posts").insert([postData]));
    }

    if (!error) {
      navigate("/admin/posts");
    } else {
      alert("保存失败：" + error.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{id ? "编辑文章" : "写新文章"}</h1>
        <button
          onClick={() => navigate("/admin/posts")}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
        >
          取消
        </button>
      </div>

      <div className="space-y-6">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            placeholder="请输入文章标题"
          />
        </div>

        {/* 分类和标签 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">分类</label>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(Number(e.target.value) || null)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">无分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">标签</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              placeholder="用逗号分隔，如：React, TypeScript"
            />
          </div>
        </div>

        {/* 摘要 */}
        <div>
          <label className="block text-sm font-medium mb-2">摘要</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            placeholder="文章摘要（选填，不填则自动截取内容前150字）"
          />
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
            placeholder="支持 Markdown 格式"
          />
          <p className="text-xs text-gray-500 mt-1">
            支持 Markdown 语法： # 标题， **加粗**， - 列表， [链接](url) 等
          </p>
        </div>

        {/* 发布选项 */}
        <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium">立即发布</span>
          </label>
          {!isPublished && (
            <span className="text-sm text-yellow-600 dark:text-yellow-500">
              ⚠️ 草稿状态，不会在博客列表显示
            </span>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={savePost}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "保存中..." : id ? "更新文章" : "发布文章"}
          </button>
          <button
            onClick={() => navigate("/admin/posts")}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            返回列表
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
