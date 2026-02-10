// 定义技能信息
export interface Skill {
  name: string; // 技能名称，字符串类型
  level: "Beginner" | "Intermediate" | "Advanced"; // 技能等级，只能是这三个值之一
}

// 定义项目经历
export interface Project {
  name: string; // 项目名称
  description: string; // 项目描述
  link?: string; // 可选，项目链接
}

// 定义教育经历
export interface Education {
  school: string; // 学校名称
  degree: string; // 学位
  startYear: number; // 入学年份
  endYear: number; // 毕业年份
}

// 定义联系方式
export interface ContactInfo {
  email: string; // 必填邮箱
  phone?: string; // 可选电话
  github?: string; // 可选 GitHub 地址
  linkedin?: string; // 可选 LinkedIn 地址
}

// 定义个人简介信息
export interface AboutInfo {
  bio: string; // 简介文字
  avatar?: string; // 可选头像 URL
}
