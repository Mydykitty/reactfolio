# 💼 ReactFolio - 个人简历 + 博客系统

![项目截图](https://via.placeholder.com/800x400.png?text=ReactFolio+Screenshot)

<div align="center">

[![Vercel](https://img.shields.io/badge/在线预览-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://reactfolio-sooty.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Mydykitty/reactfolio)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()

</div>

## ✨ 在线体验

👉 **[点击查看在线 Demo](https://reactfolio-sooty.vercel.app/)**

## 📖 项目介绍

一个功能丰富的个人简历网站 + 博客系统，集成了用户认证、留言板、后台管理和数据分析等功能。既可以作为个人简历展示，也可以作为技术博客使用。

### 🎯 主要功能

#### 📄 简历展示

- 个人简介与头像
- 技能展示（列表视图/热力图/雷达图）
- 项目作品集（分类筛选）
- 联系方式

#### 💬 交互社区

- GitHub OAuth 登录
- 留言板（点赞、编辑、删除）
- 表情反应（👍❤️😂😮😢😡）
- 留言词云（热门词可视化）
- 访客计数器

#### 📝 博客系统

- 文章列表（分页、分类、搜索）
- Markdown 文章详情（代码高亮、目录）
- 文章评论
- 阅读进度条

#### 👨‍💻 管理后台

- 仪表盘（数据统计）
- 文章管理（增删改查、发布/草稿）
- 分类管理
- 访问来源分析（UTM、搜索引擎、社交媒体）

#### 🎨 技术特性

- 🌓 深色模式（跟随系统/手动切换）
- 📱 响应式设计（手机/平板/桌面）
- ⚡ 滚动动画 + 懒加载
- 📦 PWA 支持（可离线访问）
- 🌐 多语言（中英文）
- 🔍 SEO 友好

## 🛠️ 技术栈

| 领域         | 技术选型                 |
| ------------ | ------------------------ |
| **前端框架** | React 18                 |
| **开发语言** | TypeScript               |
| **样式方案** | TailwindCSS              |
| **构建工具** | Vite                     |
| **状态管理** | Zustand                  |
| **后端服务** | Supabase (PostgreSQL)    |
| **认证系统** | GitHub OAuth             |
| **图表库**   | Recharts, D3             |
| **Markdown** | ReactMarkdown + 代码高亮 |
| **动画效果** | Framer Motion            |
| **国际化**   | i18next                  |
| **PWA**      | Vite PWA Plugin          |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm/yarn/pnpm

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Mydykitty/reactfolio.git
cd reactfolio

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置

# 4. 启动开发服务器
npm run dev

# 5. 构建生产版本
npm run build
```

### 环境变量配置

```
VITE*SUPABASE_URL=你的\_Supabase_URL
VITE_SUPABASE_ANON_KEY=你的\_Supabase*匿名密钥
```

### 🗄️ 数据库表结构

项目使用 Supabase，主要包含以下表：

```
profiles - 用户资料
posts - 博客文章
categories - 文章分类
messages - 留言板
message_likes - 留言点赞
message_reactions - 留言表情
visit_logs - 访问记录
site_stats - 网站统计
```

### Homepage URL

```
本地部署：http://localhost:5173
线上部署：https://reactfolio-sooty.vercel.app/
```

### 依赖

```
https://supabase.com
https://vercel.com
```

## 📊 功能模块与文件对应表

功能模块列表

### 📄 简历展示

核心文件：Header.tsx, About.tsx, Skills.tsx, Projects.tsx, Contact.tsx

辅助文件：skills.ts, Typewriter.tsx, SkillsHeatmap.tsx

功能描述：个人简介、头像展示、技能图谱（列表/热力图/雷达图）、项目作品集（分类筛选）、联系方式

### 🔐 用户认证

核心文件：authStore.ts, GitHubLogin.tsx

辅助文件：supabase.ts

功能描述：GitHub OAuth登录、用户状态管理（Zustand）、登录状态持久化

### 👤 个人中心

核心文件：ProfilePage.tsx

辅助文件：supabase.ts, authStore.ts

功能描述：个人资料编辑、头像上传（图片裁剪、2MB限制）、个人信息展示

### 💬 留言板

核心文件：Guestbook.tsx, GuestbookMessage.tsx

辅助文件：likeStore.ts, MessageReactions.tsx, GuestbookWordCloud.tsx

功能描述：留言发布/编辑/删除、点赞功能、表情反应（👍❤️😂😮😢😡）、留言词云（D3可视化、时间筛选）、管理员置顶

### 📝 博客系统

核心文件：BlogPage.tsx, PostPage.tsx, BlogCard.tsx

辅助文件：BlogComments.tsx, BlogTOC.tsx, CodeBlock.tsx, ReadingProgress.tsx

功能描述：文章列表（分页/分类/搜索）、Markdown渲染、代码高亮（带复制）、文章目录、阅读进度条、评论系统

### 👨‍💼 管理后台

核心文件：AdminLayout.tsx, Dashboard.tsx, PostManager.tsx, PostEditor.tsx, CategoryManager.tsx

辅助文件：SourceAnalysis.tsx

功能描述：仪表盘（数据统计卡片）、文章管理（增删改查、草稿/发布）、分类管理、来源分析（UTM追踪）、管理员权限控制

### 📊 数据分析

核心文件：visitLogger.ts, SourceAnalysis.tsx

辅助文件：VisitorCounter.tsx

功能描述：访问追踪（referer/UTM参数）、来源分析（图表展示：饼图/柱状图）、访客计数（会话去重）

### 🎨 通用组件

核心文件：Button.tsx, LazyImage.tsx, LoadingSpinner.tsx

辅助文件：ScrollReveal.tsx, BackToTop.tsx

功能描述：可复用UI组件、图片懒加载（WebP支持、响应式）、滚动动画、回到顶部（平滑滚动）

### 🌐 国际化

核心文件：i18n/config.ts

辅助文件：zh.json, en.json, LanguageSwitcher.tsx

功能描述：中英文切换、语言自动检测（浏览器/localStorage）、翻译资源文件

### 📦 PWA支持

核心文件：vite.config.ts

辅助文件：main.tsx, vite-pwa.d.ts

功能描述：离线访问（Service Worker）、应用安装（manifest配置）、自动更新检测

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

Fork 本仓库

创建你的特性分支 (git checkout -b feature/AmazingFeature)

提交更改 (git commit -m 'Add some AmazingFeature')

推送到分支 (git push origin feature/AmazingFeature)

打开一个 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源。

👤 作者
mydykitty

GitHub: @mydykitty

## 🙏 致谢

React

TailwindCSS

Supabase

Vercel - 托管服务

## 本地可参考命令

```
Cmd + Shift + P → TypeScript: Restart TS Server

npm install react-intersection-observer

npm install -D @vitejs/plugin-vue tailwindcss postcss autoprefixer

npx tailwindcss init

npm install framer-motion

npm install @supabase/supabase-js

npm install zustand

npm install react-markdown remark-gfm rehype-raw

npm install -D @tailwindcss/typography

npm install react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter

npm install recharts

npm install react-avatar-editor

npm install browser-image-compression

npm install --save-dev @types/react

npm install react-wordcloud

npm install d3 d3-cloud

npm install --save-dev @types/d3 @types/d3-cloud

npm install i18next react-i18next i18next-browser-languagedetector

Settings/Developer settings/ReactFolio

```
