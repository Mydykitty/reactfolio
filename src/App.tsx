import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // 添加路由
import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import BackToTop from "./components/BackToTop";
import ScrollReveal from "./components/ScrollReveal";
import Guestbook from "./components/Guestbook";
import Button from "./components/common/Button";
import GitHubLogin from "./components/GitHubLogin";
import VisitorCounter from "./components/VisitorCounter";
// 导入博客页面
import BlogPage from "./pages/BlogPage";
import PostPage from "./pages/PostPage";
import type { Project, ContactInfo, AboutInfo } from "./types";
import avatarImg from "./assets/avatar.png";
import { useAuthStore } from "./store/authStore";
import { useLikeStore } from "./store/likeStore";
import { supabase } from "./lib/supabase";
import AdminLayout from "./components/admin/AdminLayout";
import PostManager from "./pages/admin/PostManager";

// 项目数据
const projects: Project[] = [
  {
    name: "个人简历网页",
    description:
      "用React + TypeScript制作的个人简历网页，支持深色模式、响应式设计",
    link: "#",
    category: "react",
    tags: ["React", "TypeScript", "Tailwind"],
  },
  {
    name: "待办清单应用",
    description: "全栈待办应用，React + Node.js + MongoDB",
    link: "#",
    category: "fullstack",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "天气查询小程序",
    description: "实时天气查询，调用第三方API",
    link: "#",
    category: "vanilla",
    tags: ["JavaScript", "API"],
  },
];

const contact: ContactInfo = {
  email: "yourname@example.com",
  github: "https://github.com/yourname",
  linkedin: "https://linkedin.com/in/yourname",
};

const about: AboutInfo = {
  bio: "前端开发工程师，热爱 React 和 TypeScript，喜欢制作简洁美观的网页。",
  avatar: avatarImg,
};

// 创建主页布局组件
const MainLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // 获取 store 方法
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const fetchUserLikes = useLikeStore((state) => state.fetchUserLikes);

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // 初始化认证和点赞数据
  useEffect(() => {
    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.setState({ user: session?.user || null });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

  // 当用户登录状态变化时，获取用户的点赞数据
  useEffect(() => {
    if (user) {
      fetchUserLikes();
    }
  }, [user, fetchUserLikes]);

  // 切换主题
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newTheme);
      return newTheme;
    });
  };

  return (
    <div className="app max-w-3xl mx-auto p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-4">
        <VisitorCounter />
        <div className="flex gap-2">
          <Button onClick={toggleTheme}>
            {darkMode ? "☀️ 亮色模式" : "🌙 暗黑模式"}
          </Button>
          <GitHubLogin />
        </div>
      </div>

      {/* 主要内容区域 */}
      <Header name="张三" title="前端开发工程师" />

      <ScrollReveal>
        <About about={about} />
      </ScrollReveal>

      <ScrollReveal>
        <Skills />
      </ScrollReveal>

      <ScrollReveal>
        <Projects projects={projects} />
      </ScrollReveal>

      <ScrollReveal>
        <Contact contact={contact} />
      </ScrollReveal>

      <ScrollReveal>
        <Guestbook />
      </ScrollReveal>

      <BackToTop />
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<PostPage />} />

        {/* 后台管理路由 - 必须放在 Routes 内部 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<PostManager />} />
          <Route path="posts" element={<PostManager />} />
          <Route path="posts/new" element={<div>写文章页面（待实现）</div>} />
          <Route
            path="posts/edit/:id"
            element={<div>编辑文章页面（待实现）</div>}
          />
          <Route path="categories" element={<div>分类管理（待实现）</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
