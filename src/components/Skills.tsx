import type { FC } from "react";
import { useEffect, useState } from "react";
import { skills } from "../data/skills";
import type { Skill } from "../data/skills";
import { useInView } from "react-intersection-observer";
import SkillsHeatmap from "./SkillsHeatmap"; // 导入热力图组件

const Skills: FC = () => {
  // 监听整个 Skills 区块是否进入视口
  const { ref, inView } = useInView({ triggerOnce: true });

  // 视图模式切换
  const [viewMode, setViewMode] = useState<"list" | "heatmap">("heatmap");

  // 初始化每个技能等级为 0
  const [animatedLevels, setAnimatedLevels] = useState<Skill[]>(
    skills.map((s) => ({ ...s, level: 0 })),
  );

  // 组件挂载后，如果 inView 为 true，依次动画每个技能条
  useEffect(() => {
    if (!inView) return;

    skills.forEach((skill, idx) => {
      setTimeout(() => {
        setAnimatedLevels((prev) => {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], level: skill.level };
          return copy;
        });
      }, idx * 200); // 每个技能条延迟 200ms 动画
    });
  }, [inView]);

  return (
    <section
      ref={ref}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300"
    >
      {/* 标题和视图切换按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">⚡ 技能栈</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            列表视图
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              viewMode === "heatmap"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            热力图
          </button>
        </div>
      </div>

      {/* 根据视图模式显示不同内容 */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {animatedLevels.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{skill.name}</span>
                <span className="text-sm">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 h-4 rounded overflow-hidden shadow-inner">
                <div
                  className="bg-blue-500 h-4 rounded transition-all duration-1000 ease-out shadow-md"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SkillsHeatmap />
      )}
    </section>
  );
};

export default Skills;
