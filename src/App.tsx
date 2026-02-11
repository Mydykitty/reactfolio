import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import type { Project, ContactInfo, AboutInfo } from "./types";
import avatarImg from "./assets/avatar.png";
import "./App.css";
import ScrollReveal from "./components/ScrollReveal.tsx";

const projects: Project[] = [
  {
    name: "个人简历网页",
    description: "用React + TypeScript制作的个人简历网页",
    link: "#",
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

  // 使用 useEffect 来加载并设置主题
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // 切换主题
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      document.body.classList.toggle("dark", newTheme);
      return newTheme;
    });
  };

  return (
    <div className="app">
      <button onClick={toggleTheme} className="theme-toggle-btn">
        {darkMode ? "切换到亮色模式" : "切换到暗黑模式"}
      </button>
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
    </div>
  );
};

export default App;
