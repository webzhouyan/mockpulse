<p align="center">
  <h1 align="center">MockPulse</h1>
  <p align="center">
    <strong>Modern, Ultra-fast, 100% Offline Local API Mocking and Simulation Workspace</strong>
  </p>
  <p align="center">
    <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
  </p>
</p>

---

## 📖 Introduction

**MockPulse** is a lightweight, privacy-first, and distraction-free local API mock and simulation toolkit tailored for developers.

Completely rebuilt with **Electron + React 19 + Material-UI + Vite 8**, all cloud servers, remote logins, and telemetry tracking have been stripped down to ensure maximum privacy, blazing-fast speed, and an intuitive developer experience.

---

## ✨ Features

- 🔒 **100% Offline & Private**: Zero cloud dependency, no account sign-in required, and zero telemetry tracking. All configuration data is strictly stored locally.
- ⚡ **Next-Gen Architecture**: Powered by React 19 + Material-UI + Vite 8, achieving sub-second hot reloading and cold boots.
- 🎨 **Material 3 Design**:
  - Seamless toggle between **Light** and **Dark** modes, eliminating background contrast issues found in legacy apps.
  - 5 pre-configured palette presets (Modern Indigo, Emerald Teal, Cyber Purple, Sunset Amber, Slate Minimal).
  - Flexible **Compact (Default)** and **Comfortable** layout density options for high productivity and readability.
- 🗂️ **Collapsible Sidebar**: Shrink the left environments drawer into a sleek 56px icon rail with live pulse status dots to maximize canvas space.
- 🔄 **Reorderable Navigation Tabs**: Drag and drop tabs (Routes, Data Buckets, Headers, Callbacks, Logs, Proxy) to customize your workspace order. Smooth horizontal scrolling ensures buttons are never obscured.
- 🛠️ **Comprehensive Core Tooling**:
  - **Environments**: Multi-port simultaneous servers, live status indicators, JSON import/export, and duplication.
  - **Routes Management**: Method color badges (GET/POST/PUT/DELETE), path search, multi-response branches with dynamic rule matching (Rules engine), latency simulation, and custom status codes.
  - **Data Buckets**: Reusable dynamic templates powered by Handlebars and Faker.
  - **Global Headers**: Define global headers (such as CORS or authorization) that automatically apply to all responses.
  - **Callbacks / Webhooks**: Trigger asynchronous HTTP POST/GET notifications upon incoming requests.
  - **Real-Time Request Logs**: Millisecond-level duration breakdown, complete request/response headers/body inspection, and one-click clear.
  - **Proxy Mode**: Forward unhandled routes to remote or local backends with prefix stripping support.
- 🌐 **Internationalization**: Full bilingual support for **简体中文** and **English**.

---

## 📦 Installation & Download

Download the latest installer from [GitHub Releases](https://github.com/webzhouyan/mockpulse/releases):

- **macOS (Apple Silicon, arm64)**: `MockPulse.setup.1.0.0.arm64.dmg`
- **macOS (Intel, x64)**: `MockPulse.setup.1.0.0.x64.dmg`
- **Windows / Linux**: Can be built directly from source.

---

## 🛠️ Local Development & Build

### Prerequisites
- **Node.js**: `>= 22.12.0` (Node 22 LTS recommended)
- **npm**: `>= 10.0.0`

### 1. Clone the repository
```bash
git clone https://github.com/webzhouyan/mockpulse.git
cd mockpulse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development
```bash
npm run build:desktop:dev
npm run start:desktop:dev
```

### 4. Build desktop package (macOS arm64)
```bash
npm run package:desktop:mac:arm64
```
The output DMG file will be generated in `packages/app/packages/`.

---

## 📄 License

Open-source under the [MIT License](./LICENSE).
