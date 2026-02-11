import type { FC } from "react";
import {useEffect, useState } from "react";
import { skills } from "../data/skills"; // 确保 skills 数据正确
import type { Skill } from "../data/skills"; // 确保 Skill 类型正确
import { useInView } from "react-intersection-observer";

const Skills: FC = () => {
  const { ref, inView } = useInView({ triggerOnce: true });

  // 初始化每个技能等级为 0
  const [animatedLevels, setAnimatedLevels] = useState<Skill[]>(
    skills.map(s => ({ ...s, level: 0 }))
  );

  // 使用 useEffect 动画显示技能条
  useEffect(() => {
    if (!inView) return;

    console.log("Skills in view, starting animation");

    // 动画执行：依次显示每个技能条的进度
    skills.forEach((skill, idx) => {
      setTimeout(() => {
        setAnimatedLevels(prev => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], level: skill.level };
          return updated;
        });
      }, idx * 200); // 每个技能条延迟 200ms 动画
    });
  }, [inView]);

  return (
    <section ref={ref} className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Skills</h2>
      <div className="space-y-4">
        {animatedLevels.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{skill.name}</span>
              <span className="text-sm">{skill.level}%</span>
            </div>
            <div className="w-full bg-gray-200 h-4 rounded overflow-hidden">
              <div
                className="bg-blue-500 h-4 rounded"
                style={{
                  width: `${skill.level}%`, // 动态设置进度条的宽度
                  transition: "width 1s ease-out", // 添加平滑过渡
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
