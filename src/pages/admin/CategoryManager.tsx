import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count: number;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  const addCategory = async () => {
    if (!newName.trim()) return;

    await supabase.from("categories").insert([
      {
        name: newName,
        slug: generateSlug(newName),
        description: newDescription,
      },
    ]);

    setNewName("");
    setNewDescription("");
    fetchCategories();
  };

  const updateCategory = async (id: number) => {
    await supabase
      .from("categories")
      .update({
        name: editName,
        slug: generateSlug(editName),
        description: editDescription,
      })
      .eq("id", id);

    setEditingId(null);
    fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    if (!window.confirm("确定要删除这个分类吗？")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">分类管理</h1>

      {/* 新增分类表单 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">新增分类</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="分类描述"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            添加分类
          </button>
        </div>
      </div>

      {/* 分类列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">名称</th>
              <th className="px-6 py-3 text-left">描述</th>
              <th className="px-6 py-3 text-left">文章数</th>
              <th className="px-6 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t dark:border-gray-700">
                {editingId === cat.id ? (
                  // 编辑模式
                  <>
                    <td className="px-6 py-4">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">{cat.post_count}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => updateCategory(cat.id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        取消
                      </button>
                    </td>
                  </>
                ) : (
                  // 显示模式
                  <>
                    <td className="px-6 py-4">{cat.name}</td>
                    <td className="px-6 py-4">{cat.description}</td>
                    <td className="px-6 py-4">{cat.post_count}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setEditDescription(cat.description || "");
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManager;
