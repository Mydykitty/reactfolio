import React from "react"; // 引入 React
import type { ContactInfo } from "../types"; // 导入 ContactInfo 接口类型

// 定义组件接收的 props 类型
interface ContactProps {
  contact: ContactInfo; // contact 对象必须符合 ContactInfo 接口
}

// 定义 Contact 组件
const Contact: React.FC<ContactProps> = ({ contact }) => (
  <section className="contact">
    <h2>联系方式</h2> {/* 模块标题 */}

    <ul>
      {/* 邮箱是必填项，直接显示 */}
      <li>Email: {contact.email}</li>

      {/* 如果有电话才显示 */}
      {contact.phone && <li>Phone: {contact.phone}</li>}

      {/* 如果有 GitHub 地址才显示链接 */}
      {contact.github && (
        <li>
          GitHub: <a href={contact.github}>{contact.github}</a>
        </li>
      )}

      {/* 如果有 LinkedIn 地址才显示链接 */}
      {contact.linkedin && (
        <li>
          LinkedIn: <a href={contact.linkedin}>{contact.linkedin}</a>
        </li>
      )}
    </ul>
  </section>
);

export default Contact; // 导出组件
