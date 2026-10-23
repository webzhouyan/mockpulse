<p align="center">
  <h1 align="center">MockPulse</h1>
  <p align="center">
    <strong>现代化、极速、纯本地离线的 API 模拟与调试工作台</strong>
  </p>
  <p align="center">
    <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
  </p>
</p>

---

## 📖 项目简介

**MockPulse** 是一款专为开发者打造的**纯单机、零网络依赖、现代极简**的本地 API 模拟（Mock）工具。

基于 **Electron + React 19 + Material-UI + Vite 8** 全新架构重构，彻底移除了所有云端服务、登录验证与远程追踪代码，专注于提供极致流畅、隐私安全、高信息密度的本地接口调试体验。

---

## ✨ 核心特性

- 🔒 **100% 离线与隐私保护**：彻底剔除远程服务器、登录验证与遥测追踪，所有配置与数据纯本地存储，绝无数据泄露风险。
- ⚡ **极速现代化架构**：由 React 19 + Material-UI + Vite 8 全新驱动，毫秒级热更新与冷启动，彻底告别卡顿与臃肿。
- 🎨 **Material 3 视觉升级**：
  - 支持 **明亮浅色 (Light)** 与 **优雅深色 (Dark)** 模式无缝切换，彻底解决传统弹窗黑白割裂问题。
  - 内置 5 套精心调配的主题色彩（现代极光蓝、清透翡翠青、赛博霓虹紫、日落暖金橙、极简石板灰）。
  - 支持 **紧凑布局 (Compact，默认)** 与 **宽松布局 (Comfortable)** 自由切换，完美兼顾高信息密度与舒适阅读。
- 🗂️ **灵活可折叠侧边栏**：左侧环境列表支持一键折叠为极简图标状态（56px），带运行呼吸灯指示，最大化工作区域。
- 🔄 **自由排序导航栏**：顶部功能选项卡（路由、数据桶、响应头、回调、请求日志等）支持**长按/拖拽自由调整顺序**，自适应任意窗口宽度平滑横向滚动，永不遮挡操作按钮。
- 🛠️ **全套核心功能**：
  - **环境管理**：多环境独立端口运行、一键启停、状态呼吸灯、导入导出 JSON、快速复制。
  - **路由接口管理**：GET/POST/PUT/DELETE 等全请求方法彩色徽章、路径搜索、多响应分支条件匹配（Rules 引擎）、延迟时间、状态码自定。
  - **数据桶 (Data Buckets)**：支持 Faker 动态生成与 Handlebars 模板语法，轻松复用动态 Mock 数据。
  - **全局响应头 (Global Headers)**：一键配置全环境自动下发的响应头（CORS、鉴权等）。
  - **回调 Webhooks (Callbacks)**：支持接口返回后异步向指定第三方 URL 发送 POST/GET 回调。
  - **实时请求日志 (Request Logs)**：精准毫秒级耗时监控、请求/响应报文（Headers/Body）即时查看与一键清空。
  - **代理转发 (Proxy Mode)**：未匹配接口智能转发至外部或真实后端服务，支持前缀剔除。
- 🌐 **多语言支持**：内置 **简体中文** 与 **English** 一键无缝切换。

---

## 📦 安装与下载

前往 [GitHub Releases](https://github.com/webzhouyan/mockpulse/releases) 下载适合您操作系统的最新安装包：

- **macOS (Apple Silicon, arm64)**: `MockPulse.setup.1.0.0.arm64.dmg`
- **macOS (Intel, x64)**: `MockPulse.setup.1.0.0.x64.dmg`
- **Windows / Linux**: 支持从源码直接打包运行。

---

## 🛠️ 本地开发与构建

### 前置环境要求
- **Node.js**: `>= 22.12.0` (推荐 Node 22 LTS)
- **npm**: `>= 10.0.0`

### 1. 克隆代码仓库
```bash
git clone https://github.com/webzhouyan/mockpulse.git
cd mockpulse
```

### 2. 安装依赖
```bash
npm install
```

### 3. 本地启动开发
```bash
npm run build:desktop:dev
npm run start:desktop:dev
```

### 4. 生产环境打包 (macOS arm64)
```bash
npm run package:desktop:mac:arm64
```
打包输出文件将存放于 `packages/app/packages/` 目录下。

---

## 📄 开源许可证

本项目基于 [MIT License](./LICENSE) 协议开源。
