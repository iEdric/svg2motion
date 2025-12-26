# VectorMotion Pro - SVG动画转换工具

> ✨ 超酷的SVG动画转换工具，将SVG动画转换为高质量视频或GIF格式

[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC.svg)](https://tailwindcss.com/)

## 🌟 项目简介

VectorMotion Pro 是一个现代化的Web应用程序，专门用于将SVG动画转换为高质量的视频文件（MP4/WebM）或动画GIF。通过直观的界面和强大的转换引擎，您可以轻松地将复杂的SVG动画转换为各种媒体格式，用于分享、演示或集成到其他项目中。

### ✨ 核心特性

- 🎨 **SVG动画支持**：完整支持SMIL动画和CSS动画
- 🎬 **多格式导出**：导出为MP4、WebM或GIF格式
- 🎛️ **参数控制**：可调节帧率、时长、缩放比例和质量
- 🎨 **背景选项**：支持透明背景或白色背景
- 📱 **响应式设计**：适配桌面和移动设备
- ⚡ **实时预览**：所见即所得的动画预览
- 🔧 **代码编辑**：内置SVG代码编辑器，支持语法高亮

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd svg2motion
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

### 使用方法

1. 在代码编辑器中输入或粘贴SVG动画代码
2. 在预览面板中查看动画效果
3. 在设置面板中调整导出参数：
   - 选择导出格式（MP4/GIF/WebM）
   - 设置帧率（12-60 FPS）
   - 调整动画时长（0.5-15秒）
   - 设置导出缩放比例（0.5x-4x）
   - 选择背景类型（透明/白色）
4. 点击"导出"按钮开始转换
5. 下载生成的媒体文件

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS (CDN)
- **图标库**：Font Awesome
- **字体**：Inter + Fira Code
- **动画库**：原生Web Animations API
- **媒体处理**：Canvas API + MediaRecorder

## 📁 项目结构

```
src/
├── App.tsx              # 主应用组件
├── main.tsx             # 应用入口
├── index.css            # 全局样式
├── types.ts             # TypeScript类型定义
└── services/
    ├── converter.ts     # SVG转换核心逻辑
    └── geminiService.ts # AI服务（已弃用）
```

## 🎨 UI设计特色

- **现代化界面**：采用暗色主题，毛玻璃效果
- **流畅交互**：平滑的过渡动画和反馈
- **专业布局**：三面板设计（代码-预览-设置）
- **响应式适配**：完美支持各种屏幕尺寸
- **直观操作**：拖拽上传，实时参数调节

## 🔧 开发指南

### 代码规范

项目使用ESLint进行代码质量检查：

```bash
npm run lint
```

### 构建优化

- 使用Vite进行快速开发和优化构建
- 支持热模块替换（HMR）
- 自动代码分割和压缩

### SVG动画支持

支持以下SVG动画类型：
- SMIL动画（`<animate>`, `<animateTransform>`, `<animateMotion>`）
- CSS动画和过渡
- 复杂的变换和路径动画

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 联系我们

如有问题或建议，请通过GitHub Issues联系我们。

---

**让SVG动画活起来！** 🎭✨
