import React from "react"; // 引入 React
import type { Project } from "../types"; // 导入 Project 接口类型

// 定义组件接收的 props 类型
interface ProjectsProps {
  projects: Project[]; // projects 是一个 Project 类型的数组
}

// 定义 Projects 组件
const Projects: React.FC<ProjectsProps> = ({ projects }) => (
  <section className="projects">
    <h2>项目经验</h2> {/* 模块标题 */}

    {/* 遍历 projects 数组，渲染每个项目 */}
    {projects.map((p, i) => (
      <div key={i}> {/* 每个项目一个容器 */}
        <h3>{p.name}</h3> {/* 项目名称 */}
        <p>{p.description}</p> {/* 项目描述 */}

        {/* 如果有项目链接才显示链接 */}
        {p.link && (
          <a href={p.link} target="_blank">
            查看项目
          </a>
        )}
      </div>
    ))}
  </section>
);

export default Projects; // 导出组件
