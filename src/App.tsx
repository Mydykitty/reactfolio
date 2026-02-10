import React from "react";
import Header from "./components/Header";
import About from "./components/about";
import Skills from "./components/skills";
import Projects from "./components/projects";
import Contact from "./components/contact";
import type { Skill, Project, ContactInfo, AboutInfo } from "./types";
import avatarImg from "./assets/avatar.png";
import "./App.css";

const skills: Skill[] = [
  { name: "React", level: "Intermediate" },
  { name: "TypeScript", level: "Intermediate" },
  { name: "CSS", level: "Advanced" },
];

const projects: Project[] = [
  { name: "个人简历网页", description: "用React + TypeScript制作的个人简历网页", link: "#" },
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

const App: React.FC = () => (
  <div className="app">
    <Header name="张三" title="前端开发工程师" />
    <About about={about} />
    <Skills skills={skills} />
    <Projects projects={projects} />
    <Contact contact={contact} />
  </div>
);

export default App;
