import React, { useState } from "react";
import type { Project } from "../types";

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [filter, setFilter] = useState("all");

  // 获取所有分类（去重）
  const categories = ["all", ...new Set(projects.map((p) => p.category))];

  // 筛选项目
  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        项目
      </h2>

      {/* 筛选按钮组 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300
              ${
                filter === category
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {category === "all" ? "全部" : category}
          </button>
        ))}
      </div>

      {/* 项目列表 */}
      <div className="space-y-4">
        {filteredProjects.map((project, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {project.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {project.description}
            </p>

            {/* 标签云 */}
            {project.tags && (
              <div className="flex flex-wrap gap-2 mb-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {project.link && project.link !== "#" && (
              <a
                href={project.link}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                查看项目 →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredProjects.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          暂无该分类的项目
        </p>
      )}
    </section>
  );
};

export default Projects;
