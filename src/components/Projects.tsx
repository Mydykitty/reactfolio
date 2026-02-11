import React from "react";
import type { Project } from "../types";

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        项目
      </h2>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {project.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {project.description}
            </p>
            <a
              href={project.link}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              查看项目
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
