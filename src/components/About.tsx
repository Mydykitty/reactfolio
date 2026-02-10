import React from "react"; // 引入 React
import type { AboutInfo } from "../types"; // 导入 AboutInfo 接口类型，用于约束 props

// 定义组件接收的 props 类型
interface AboutProps {
  about: AboutInfo; // about 对象必须符合 AboutInfo 接口
}

// 定义 About 组件，使用 React.FC 泛型指定 props 类型
const About: React.FC<AboutProps> = ({ about }) => {
  return (
    <section className="about">
      {/* 如果有头像，就显示 img 标签 */}
      {about.avatar && <img src={about.avatar} alt="头像" className="avatar" />}
      {/* 显示个人简介文字 */}
      <p>{about.bio}</p>
    </section>
  );
};

export default About; // 导出组件以供其他文件使用
