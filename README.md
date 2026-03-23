# ClawNet Web UI

<div align="center">

**🦞 Modern web interface for ClawNet management**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-blue.svg)](https://vitejs.dev/)

</div>

---

## 📖 简介

ClawNet Web 是一个现代化的 Web 管理界面，用于管理 ClawNet 实例、节点、关系和消息。

### ✨ 核心特性

- 🎨 **现代化设计** - 基于 Ant Design 的企业级 UI
- ⚡ **极速开发** - Vite + React + TypeScript
- 🔄 **实时更新** - WebSocket 支持实时数据推送
- 📱 **响应式** - 完美适配桌面和移动设备
- 🔐 **安全** - JWT 认证 + XSS/CSRF 防护
- 🌐 **多语言** - 支持中文（国际化进行中）

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

---

## 📦 项目结构

```
ClawNet-Web/
├── src/
│   ├── components/      # 组件
│   ├── pages/          # 页面
│   ├── services/       # API 服务
│   ├── store/          # 状态管理 (Zustand)
│   ├── hooks/          # 自定义 Hooks
│   ├── utils/          # 工具函数
│   ├── types/          # TypeScript 类型
│   └── styles/         # 全局样式
├── public/             # 静态资源
├── docs/               # 文档
└── package.json
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18+ | UI 框架 |
| TypeScript | 5+ | 类型安全 |
| Vite | 5+ | 构建工具 |
| Ant Design | 5+ | UI 组件库 |
| Zustand | 4+ | 状态管理 |
| Axios | 1+ | HTTP 客户端 |
| React Router | 6+ | 路由管理 |

---

## 📋 功能列表

### ✅ 已完成

- [x] 项目初始化
- [x] 基础布局
- [x] 仪表盘页面
- [x] 实例管理页面
- [x] 节点管理页面
- [x] API 服务层
- [x] 状态管理
- [x] TypeScript 类型定义

### 🚧 开发中

- [ ] WebSocket 实时通信
- [ ] 关系图谱可视化
- [ ] 消息监控
- [ ] 权限管理
- [ ] 实例详情页

### 📅 计划中

- [ ] 用户认证
- [ ] 多语言支持
- [ ] 性能优化
- [ ] 单元测试
- [ ] E2E 测试

---

## 🔌 API 集成

### 环境变量

创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### API 端点

**实例管理：**
- `GET /instances` - 获取实例列表
- `POST /instances` - 创建实例
- `POST /instances/:name/start` - 启动实例
- `POST /instances/:name/stop` - 停止实例
- `DELETE /instances/:name` - 删除实例

**节点管理：**
- `GET /nodes` - 获取节点列表
- `POST /nodes` - 创建节点
- `DELETE /nodes/:id` - 删除节点

---

## 🎨 设计系统

详见 [设计文档](docs/WEB-UI-DESIGN.md)

### 颜色

```css
主色: #1890ff (蓝色)
成功: #52c41a (绿色)
警告: #faad14 (黄色)
错误: #ff4d4f (红色)
```

### 组件

- `StatusIndicator` - 状态指示器
- `PerformanceCard` - 性能卡片
- `ActionButtons` - 操作按钮组
- `LogViewer` - 日志查看器
- `RelationGraph` - 关系图谱

---

## 🧪 开发指南

### 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

### Git 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
```

---

## 📚 文档资源

- [API 文档](docs/API.md)
- [设计文档](docs/WEB-UI-DESIGN.md)
- [开发指南](docs/DEVELOPMENT.md)

---

## 🤝 贡献指南

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md)

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

[MIT License](LICENSE)

---

## 🔗 相关项目

- [ClawNet](https://github.com/Bsheepcoder/ClawNet) - 关系驱动的智能协作网络
- [OpenClaw](https://github.com/openclaw/openclaw) - AI Agent Framework

---

<div align="center">

**Made with ❤️ by ClawNet Team**

</div>
