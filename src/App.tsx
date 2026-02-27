import React, { useState, useEffect, lazy, Suspense, useRef} from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"; // 添加 useLocation
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
import LoadingSpinner from "./components/common/LoadingSpinner";
import type { Project, ContactInfo, AboutInfo } from "./types";
import avatarImg from "./assets/avatar.png";
import { useAuthStore } from "./store/authStore";
import { useLikeStore } from "./store/likeStore";
import { supabase } from "./lib/supabase";
import { logVisit } from "./utils/visitLogger"; // 导入访问记录工具

// 懒加载所有页面组件
const BlogPage = lazy(() => import("./pages/BlogPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const PostManager = lazy(() => import("./pages/admin/PostManager"));
const PostEditor = lazy(() => import("./components/admin/PostEditor"));
const CategoryManager = lazy(() => import("./pages/admin/CategoryManager"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const SourceAnalysis = lazy(() => import("./pages/admin/SourceAnalysis")); // 新增

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

// 路由监听组件
const RouteListener: React.FC = () => {
  const location = useLocation();
  const lastLoggedRef = useRef({ path: '', time: 0 });

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const now = Date.now();

    // 5秒内相同路径不重复记录
    if (
        lastLoggedRef.current.path !== currentPath ||
        now - lastLoggedRef.current.time > 5000
    ) {
      lastLoggedRef.current = { path: currentPath, time: now };
      logVisit();
    }
  }, [location]);

  return null;
};

// 创建主页布局组件
const MainLayout: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

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
      <div className="flex justify-between items-center mb-4">
        <VisitorCounter />
        <div className="flex gap-2">
          <Button onClick={toggleTheme}>
            {darkMode ? "☀️ 亮色模式" : "🌙 暗黑模式"}
          </Button>
          <GitHubLogin />
        </div>
      </div>

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
      {/* 路由监听组件 */}
      <RouteListener />

      <Suspense fallback={<LoadingSpinner fullScreen text="页面加载中..." />}>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<PostPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* 后台管理路由 */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="posts" element={<PostManager />} />
            <Route path="posts/new" element={<PostEditor />} />
            <Route path="posts/edit/:id" element={<PostEditor />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="sources" element={<SourceAnalysis />} />{" "}
            {/* 新增来源分析路由 */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
