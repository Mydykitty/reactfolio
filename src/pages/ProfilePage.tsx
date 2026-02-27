import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

interface ProfileData {
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  location: string;
  updated_at: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // 个人资料数据
  const [profile, setProfile] = useState<ProfileData>({
    username: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    website: "",
    location: "",
    updated_at: "",
  });

  // 编辑表单数据
  const [formData, setFormData] = useState<ProfileData>({ ...profile });

  // 头像上传相关
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // 获取用户资料
  const fetchProfile = async () => {
    try {
      setLoading(true);

      // 从 profiles 表获取用户资料（如果还没有这个表，需要创建）
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 表示没有找到记录
        console.error("获取资料失败:", error);
      }

      if (data) {
        setProfile(data);
        setFormData(data);
        setAvatarPreview(data.avatar_url || "");
      } else {
        // 如果没有资料记录，用 user_metadata 初始化
        const initialData = {
          username: user?.user_metadata?.user_name || "",
          full_name: user?.user_metadata?.full_name || "",
          avatar_url: user?.user_metadata?.avatar_url || "",
          bio: "",
          website: "",
          location: "",
          updated_at: new Date().toISOString(),
        };
        setProfile(initialData);
        setFormData(initialData);
        setAvatarPreview(initialData.avatar_url);
      }
    } catch (error) {
      console.error("获取资料失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.match(/image\/(jpeg|png|gif|webp)/)) {
      alert("请上传图片文件 (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // 验证文件大小（最大 2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert("图片大小不能超过 2MB");
      return;
    }

    setAvatarFile(file);

    // 创建预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 上传头像到 Supabase Storage
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return profile.avatar_url;

    try {
      setUploading(true);

      // 生成文件名
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 上传文件
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      // 获取公共URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("头像上传失败:", error);
      alert("头像上传失败");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // 保存个人资料
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // 先上传头像（如果有新文件）
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }

      // 准备要保存的数据
      const profileData = {
        id: user.id,
        username: formData.username,
        full_name: formData.full_name,
        avatar_url: avatarUrl,
        bio: formData.bio,
        website: formData.website,
        location: formData.location,
        updated_at: new Date().toISOString(),
      };

      // 保存到 profiles 表
      const { error } = await supabase.from("profiles").upsert(profileData);

      if (error) throw error;

      // 更新本地状态
      setProfile({ ...profileData, username: formData.username });
      setEditing(false);
      setAvatarFile(null);

      alert("资料保存成功");
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setFormData({ ...profile });
    setAvatarPreview(profile.avatar_url);
    setAvatarFile(null);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 返回链接 */}
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
        >
          <span>←</span> 返回首页
        </Link>
      </div>

      {/* 标题和操作按钮 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">个人资料</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            编辑资料
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving || uploading ? "保存中..." : "保存修改"}
            </button>
          </div>
        )}
      </div>

      {/* 个人资料卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 左侧：头像区域 */}
            <div className="md:w-64 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={editing ? avatarPreview : profile.avatar_url}
                  alt={profile.full_name || "用户头像"}
                  className="w-48 h-48 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.full_name || profile.username}&background=random&size=200`;
                  }}
                />

                {editing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <span className="text-white text-sm">更换头像</span>
                  </label>
                )}
              </div>

              {uploading && (
                <p className="mt-2 text-sm text-gray-500">上传中...</p>
              )}
            </div>

            {/* 右侧：信息区域 */}
            <div className="flex-1">
              {!editing ? (
                // 查看模式
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.full_name || profile.username}
                    </h2>
                    {profile.username && (
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        @{profile.username}
                      </p>
                    )}
                  </div>

                  {profile.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        个人简介
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.location && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          所在地
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {profile.location}
                        </p>
                      </div>
                    )}

                    {profile.website && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          个人网站
                        </h3>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📧 {user?.email}</span>
                    </div>
                    {profile.updated_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        最后更新:{" "}
                        {new Date(profile.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // 编辑模式
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="用户名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        全名
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="你的名字"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">邮箱不可修改</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="介绍一下自己..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        所在地
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="城市、国家"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        个人网站
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
