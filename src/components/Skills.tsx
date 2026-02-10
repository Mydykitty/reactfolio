import React from "react"; // 引入 React
import type { Skill } from "../types"; // 导入 Skill 接口类型，用于约束 props

// 定义组件接收的 props 类型
interface SkillsProps {
  skills: Skill[]; // skills 是一个 Skill 类型数组
}

// 定义 Skills 组件，使用 React.FC 泛型指定 props 类型
const Skills: React.FC<SkillsProps> = ({ skills }) => (
  <section className="skills">
    <h2>技能</h2> {/* 区块标题 */}
    <ul>
      {/* 遍历 skills 数组，显示每个技能 */}
      {skills.map((skill, i) => (
        <li key={i}>
          {skill.name} - {skill.level} {/* 显示技能名称和等级 */}
        </li>
      ))}
    </ul>
  </section>
);

export default Skills; // 导出组件，以便其他文件使用
