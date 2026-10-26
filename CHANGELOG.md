# 更新日志 (Changelog)

本项目遵循 [Semantic Versioning (语义化版本 2.0.0)](https://semver.org/lang/zh-CN/) 规范。

---

## [1.0.2] - 2026-10-26

### ⚡ 架构瘦身与依赖裁剪 (Codebase Slimming)
- **子包物理级精简**：彻底移除针对云函数平台的 `packages/serverless` 以及无头命令行版 `packages/cli`，使 Monorepo 体系完全聚焦于纯本地离线桌面端应用。
- **依赖大幅削减**：精简移除 1,021 个冗余 npm 包，`node_modules` 依赖体积显著缩减，大幅加快冷启动与打包构建速度。
- **废弃测试套件移除**：彻底删除旧版遗留的 Angular WDIO 界面自动化测试代码与测试配置，同步剥离 `@wdio/*`、`puppeteer-core`、`@electron/notarize` 等重型依赖。
- **CI 流水线轻量化**：移除 GitHub Actions CI 中已失效的 `test-cli` 任务，构建流程更精简高效。

### 🎨 界面与体验优化 (Enhancements)
- **CodeMirror 无界沉浸体验**：注入主题级扩展规则，彻底消除 JSON 响应报文与请求编辑框行号槽位右侧的竖直分割线，代码编辑视界更纯净。
- **安装包命名去除 setup**：规范全平台安装包命名规则，去除了多余的 `setup` 标识，生成如 `MockPulse-1.0.2.exe` / `MockPulse-1.0.2.arm64.dmg`。
- **文档与视觉资产更新**：中英文 README 新增主工作台、偏好设置弹窗及 CRUD 数据桶服务 3 张高清全景界面截图与特色指引。

---

## [1.0.1] - 2026-10-23

### 🐛 缺陷修复 (Bug Fixes)
- **请求日志多层嵌套滚动死锁**：彻底修复请求日志面板在 Headers 与 Body 同时展开时出现的多层滚动条相互劫持截断、滑不到底部的问题。将详情视口高度约束标准化为 Flex 自动适应，并加入 48px 底部弹性安全间距，确保尾行数据与收尾花括号 `}` 完整展现。
- **编辑器行号分割线**：移除响应报文 CodeMirror 代码高亮编辑器行号槽位右侧多余的黑色纵向边框线。
- **响应报文滚动失效**：修复长 JSON 报文响应无法在视口内流畅滚动浏览的问题。
- **分支参数栏组件重叠**：修复接口多响应分支切换栏中开关组件与文字重叠的布局错位。
- **macOS 安装包损坏提示**：针对 macOS Gatekeeper 隔离机制在 README 中补充一键放行指引。

### 🎨 界面与体验优化 (Enhancements)
- **全新饱满应用图标 (Logo)**：去除 Logo 四周过大的冗余透明留白，主体图形等比放大居中，视觉占比从原先的 31.6% 跃升至 68.4%。macOS (.icns)、Windows (.ico) 及全套系统位图同步更新。
- **产物命名规范化**：安装包文件名去除 `setup` 标识，统一规范为 `MockPulse-${version}.${ext}`。
- **请求 Body 快捷格式化**：为请求日志中的 Body 模块新增「格式化 JSON」工具按钮，支持一键美化排版。
- **默认明亮主题**：应用启动主题默认设置为明亮模式（Light Mode），提升初次启动视觉体验。
- **接口列表响应计数**：左侧接口路由项副标题直观显示当前已配置的响应分支总数（如 `1 response` / `2 responses`）。

---

## [1.0.0] - 2026-10-23

### 🚀 初始版本发布 (Initial Release)
- **全新技术底座**：前端采用 React 19 + Material-UI (MUI v9) + Vite 8 重构现代化开发界面。
- **纯粹离线开发**：100% 本地运行，完全剥离所有远程联网、用户注册与遥测上报，数据完全安全保存在本地。
- **完整模拟能力**：
  - 支持丰富 HTTP 方法、自定义状态码、动态延迟与响应规则。
  - 支持数据桶（Data Buckets）动态 CRUD 自动化路由。
  - 支持 WebSocket 长连接消息监听与广播流式推送。
  - 支持反向代理（Proxy）穿透模式与全局 Header 预设。
  - 支持响应动作回调（Callbacks / Webhooks）。
- **OpenAPI / Swagger 互通**：100% 兼容导入与导出 OpenAPI v2 / v3 规范的 JSON 与 YAML 文件。
- **国际化与多主题**：支持简体中文与英文无缝切换，支持浅色与深色主题模式。
- **全平台支持**：支持打包为 macOS (Apple Silicon / Intel)、Windows (NSIS 安装版 / 便携绿色版) 以及 Linux (AppImage / deb / rpm)。
