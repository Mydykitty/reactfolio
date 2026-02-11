import type { FC } from "react";
import { useEffect, useState } from "react";
import { skills } from "../data/skills";
import type { Skill } from "../data/skills";
import { useInView } from "react-intersection-observer";

const Skills: FC = () => {
  // 监听整个 Skills 区块是否进入视口
  const { ref, inView } = useInView({ triggerOnce: true });

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
      <h2 className="text-2xl font-bold mb-4">Skills</h2>
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
    </section>
  );
};

export default Skills;
