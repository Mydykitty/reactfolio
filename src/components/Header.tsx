import React from "react"; // 引入 React 库，必须的

// 定义组件接收的 props 类型
interface HeaderProps {
  name: string; // 姓名
  title: string; // 职位或头衔
}

// 定义 Header 组件，使用 React.FC 泛型指定 props 类型
const Header: React.FC<HeaderProps> = ({ name, title }) => {
  return (
    // 页面头部标签，类名用于样式
    <header className="header">
      <h1>{name}</h1> {/* 显示姓名 */}
      <h3>{title}</h3> {/* 显示职位/头衔 */}
    </header>
  );
};

export default Header; // 导出组件，以便其他文件导入使用
