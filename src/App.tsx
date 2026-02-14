import React, { useState, useEffect } from "react";
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
import type { Project, ContactInfo, AboutInfo } from "./types";
import avatarImg from "./assets/avatar.png";

// 替换原来的 projects 数组
const projects: Project[] = [
  {
    name: "个人简历网页",
    description:
      "用React + TypeScript制作的个人简历网页，支持深色模式、响应式设计",
    link: "#",
    category: "react", // 新增分类
    tags: ["React", "TypeScript", "Tailwind"], // 新增标签
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

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // 初始化
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark); // ✅ html
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newTheme); // ✅ html
      return newTheme;
    });
  };

  return (
    <div className="app max-w-3xl mx-auto p-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="flex justify-end mb-4">
        <Button onClick={toggleTheme}>
          {darkMode ? "切换到亮色模式" : "切换到暗黑模式"}
        </Button>
          <GitHubLogin />
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

export default App;
