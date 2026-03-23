# ClawNet Web UI 设计方案

> **版本:** 1.0.0  
> **日期:** 2026-03-23  
> **状态:** 设计阶段

---

## 📋 目录

- [设计理念](#设计理念)
- [技术架构](#技术架构)
- [页面结构](#页面结构)
- [核心功能](#核心功能)
- [UI 组件](#ui-组件)
- [开发计划](#开发计划)

---

## 🎨 设计理念

### 核心原则

```
易用性 + 可扩展性 + 保姆式体验 = 用户成功
```

1. **零门槛上手**
   - 开箱即用，无需配置即可使用
   - 新手引导流程
   - 智能默认配置

2. **渐进式复杂度**
   - 基础功能一页搞定
   - 高级功能按需展开
   - 专家模式支持

3. **实时反馈**
   - 所有操作即时响应
   - 状态可视化
   - 错误友好提示

4. **一致性体验**
   - 统一的设计语言
   - 一致的交互模式
   - 可预测的行为

---

## 🏗️ 技术架构

### 技术栈选择

```yaml
前端框架:
  - React 18+ (推荐) 或 Vue 3+
  - TypeScript 5+
  
UI 库:
  - Ant Design (企业级) 或
  - Material-UI (Google 风格) 或
  - Chakra UI (现代简洁)
  
状态管理:
  - Zustand (轻量) 或
  - Redux Toolkit (功能完整)
  
数据通信:
  - Axios (HTTP)
  - Socket.io-client (WebSocket)
  
构建工具:
  - Vite (推荐) 或 Next.js
  
路由:
  - React Router v6+
```

### 推荐方案：React + Ant Design

**理由：**
- ✅ Ant Design 企业级组件，功能完善
- ✅ TypeScript 类型支持好
- ✅ 中文文档完善
- ✅ 社区活跃，问题易解决
- ✅ 设计风格专业稳重

---

## 📑 页面结构

### 整体布局

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo + 搜索 + 用户菜单 + 通知                  │
├───────┬─────────────────────────────────────────────────┤
│       │                                                 │
│  侧    │            主内容区                             │
│  边    │                                                 │
│  导    │     ┌─────────────────────────────────┐       │
│  航    │     │  面包屑 + 标题 + 操作按钮          │       │
│       │     ├─────────────────────────────────┤       │
│  📦    │     │                                 │       │
│  实例  │     │     内容区域                     │       │
│       │     │                                 │       │
│  🔗    │     │     (表格/卡片/表单等)            │       │
│  节点  │     │                                 │       │
│       │     │                                 │       │
│  🔗    │     └─────────────────────────────────┘       │
│  关系  │                                                 │
│       │                                                 │
│  🔐    │                                                 │
│  权限  │                                                 │
│       │                                                 │
│  📊    │                                                 │
│  监控  │                                                 │
│       │                                                 │
│  ⚙️    │                                                 │
│  设置  │                                                 │
└───────┴─────────────────────────────────────────────────┘
```

### 页面清单

| 页面 | 路由 | 说明 | 优先级 |
|------|------|------|--------|
| **首页仪表盘** | `/` | 概览、统计、快捷操作 | ⭐⭐⭐ |
| **实例管理** | `/instances` | 创建、管理 OpenClaw 实例 | ⭐⭐⭐ |
| **实例详情** | `/instances/:id` | 实例详情、配置、日志 | ⭐⭐⭐ |
| **节点管理** | `/nodes` | 节点列表、添加、编辑 | ⭐⭐⭐ |
| **关系管理** | `/relations` | 关系图谱、关系管理 | ⭐⭐ |
| **权限管理** | `/permissions` | 权限配置、角色管理 | ⭐⭐ |
| **消息监控** | `/messages` | 消息路由、实时消息 | ⭐⭐ |
| **平台适配** | `/adapters` | 平台配置、状态监控 | ⭐⭐ |
| **系统设置** | `/settings` | 全局配置、主题、API | ⭐ |
| **帮助文档** | `/docs` | 使用文档、API 文档 | ⭐ |

---

## 🌟 核心功能设计

### 1. 首页仪表盘

```
┌────────────────────────────────────────────────────────┐
│  欢迎回来！快速开始使用 ClawNet                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  │ 📦 实例   │  │ 🔗 节点   │  │ 🔗 关系   │  │ 📨 消息   │
│  │   3 个    │  │  12 个    │  │  25 个    │  │  1.2K    │
│  │  ✅ 2运行 │  │  🟢 8在线 │  │  活跃度85%│  │  今日     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘
│                                                        │
│  🚀 快速操作                                           │
│  ┌────────────────────────────────────────────────┐   │
│  │ [+ 创建实例]  [+ 添加节点]  [📤 发送消息]      │   │
│  │ [📊 查看监控]  [🔧 配置]    [📖 查看文档]      │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  📊 系统状态                                           │
│  ┌──────────────────────┬──────────────────────┐     │
│  │  实例状态             │  消息流量 (24h)      │     │
│  │  ├─ bot-1 ✅ 运行中   │  [================]  │     │
│  │  ├─ bot-2 ✅ 运行中   │  [=========]       │     │
│  │  └─ bot-3 ⏸️ 已停止   │  [=====]           │     │
│  └──────────────────────┴──────────────────────┘     │
│                                                        │
│  📋 最近活动                                           │
│  • 10:23 - 实例 bot-1 启动成功                         │
│  • 10:20 - 用户 user1 发送消息给 bot-1                 │
│  • 10:15 - 新节点 user2 已添加                         │
└────────────────────────────────────────────────────────┘
```

**功能点：**
- ✅ 4 个统计卡片（实例、节点、关系、消息）
- ✅ 快速操作按钮
- ✅ 实时系统状态
- ✅ 最近活动日志

### 2. 实例管理页面

```
┌────────────────────────────────────────────────────────┐
│  实例管理                        [+ 创建实例] [🔄 刷新] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  筛选: [状态 ▼] [平台 ▼]  搜索: [____________] 🔍      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  📦 bot-1                          ✅ 运行中      │ │
│  │  ├─ 端口: 19080  |  微信: ✅ 已登录 | 运行 2h    │ │
│  │  ├─ CPU: 12%  |  内存: 256MB  |  网络: 1.2MB/s  │ │
│  │  └─ [▶️ 详情] [⏸️ 停止] [🔄 重启] [🗑️ 删除]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  📦 bot-2                          ✅ 运行中      │ │
│  │  ├─ 端口: 19051  |  微信: ❌ 未登录 | 运行 5h    │ │
│  │  ├─ CPU: 8%  |  内存: 198MB  |  网络: 0.8MB/s   │ │
│  │  └─ [▶️ 详情] [⏸️ 停止] [🔄 重启] [🗑️ 删除]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  📦 bot-3                          ⏸️ 已停止      │ │
│  │  ├─ 端口: 19022  |  微信: -  |  停止 1d         │ │
│  │  └─ [▶️ 启动] [▶️ 详情] [🗑️ 删除]              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📄 第 1/3 页  [<] 1 2 3 [>]                          │
└────────────────────────────────────────────────────────┘
```

**功能点：**
- ✅ 实例卡片展示（状态、性能、操作）
- ✅ 筛选和搜索
- ✅ 批量操作
- ✅ 实时状态更新

**创建实例对话框：**

```
┌─────────────────────────────────────┐
│  创建新实例                    [×]  │
├─────────────────────────────────────┤
│                                     │
│  实例名称 *                         │
│  ┌─────────────────────────────┐   │
│  │ my-bot-1                    │   │
│  └─────────────────────────────┘   │
│  💡 名称只能包含字母、数字和下划线   │
│                                     │
│  ☑️ 自动安装微信插件                │
│  ☑️ 自动启动 Gateway               │
│  ☑️ 自动连接到 ClawNet             │
│                                     │
│  高级选项 [展开 ▼]                  │
│                                     │
│       [取消]        [创建实例]      │
└─────────────────────────────────────┘
```

### 3. 实例详情页面

```
┌────────────────────────────────────────────────────────┐
│  ← 返回  bot-1 实例详情                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Tab: 概览 | 配置 | 日志 | 性能 | 微信]              │
│                                                        │
│  ━━━ 概览 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                        │
│  基本信息                                              │
│  ┌────────────────────────────────────────────────┐   │
│  │  实例名称: bot-1                                │   │
│  │  端口: 19080                                    │   │
│  │  状态: ✅ 运行中                                │   │
│  │  运行时长: 2小时 15分钟                          │   │
│  │  微信状态: ✅ 已登录 (user123)                  │   │
│  │  ClawNet: ✅ 已连接                             │   │
│  │  创建时间: 2026-03-23 18:00:00                  │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  性能指标                                              │
│  ┌──────────────┬──────────────┬──────────────┐      │
│  │  CPU 使用率   │  内存使用     │  网络流量     │      │
│  │    12%       │   256 MB     │  1.2 MB/s    │      │
│  │  [===]       │  [======]    │  [====]      │      │
│  └──────────────┴──────────────┴──────────────┘      │
│                                                        │
│  快速操作                                              │
│  [⏸️ 停止] [🔄 重启] [🔐 重新登录] [📊 查看日志]     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Tab 页签：**
1. **概览** - 基本信息、性能指标、快速操作
2. **配置** - 实例配置编辑
3. **日志** - 实时日志查看（支持搜索、过滤）
4. **性能** - 性能图表（CPU、内存、网络）
5. **微信** - 微信登录状态、二维码、账号信息

### 4. 节点管理页面

```
┌────────────────────────────────────────────────────────┐
│  节点管理                        [+ 添加节点] [🔄 刷新] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  筛选: [类型 ▼] [状态 ▼]  搜索: [____________] 🔍      │
│                                                        │
│  ┌────────────────────────────────────────────────────┐│
│  │ ☑ │ ID      │ 类型  │ 名称   │ 状态  │ 创建时间   ││
│  ├───┼─────────┼───────┼────────┼───────┼────────────┤│
│  │ □ │ bot-1   │ bot   │ Bot 1  │ 🟢 在线│ 2026-03-20 ││
│  │ □ │ bot-2   │ bot   │ Bot 2  │ 🟢 在线│ 2026-03-21 ││
│  │ □ │ user-1  │ user  │ Alice  │ 🟡 离线│ 2026-03-22 ││
│  │ □ │ user-2  │ user  │ Bob    │ 🟢 在线│ 2026-03-23 ││
│  │ □ │ agent-1 │ agent │ Agent1 │ 🟢 在线│ 2026-03-23 ││
│  └────────────────────────────────────────────────────┘│
│                                                        │
│  已选择 0 项  [批量删除] [批量编辑]                    │
│  📄 第 1/5 页  [<] 1 2 3 4 5 [>]                      │
└────────────────────────────────────────────────────────┘
```

**节点类型图标：**
- 🤖 `bot` - 机器人节点
- 👤 `user` - 用户节点
- 🤖 `agent` - AI 代理节点
- ⚙️ `service` - 服务节点

### 5. 关系管理页面（可视化）

```
┌────────────────────────────────────────────────────────┐
│  关系管理              [列表视图 | 图谱视图]  [+ 建立关系] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │         🤖 bot-1                                │  │
│  │         /    \                                  │  │
│  │      friend  admin                              │  │
│  │       /        \                                │  │
│  │   👤 user-1   👤 user-2                         │  │
│  │     |            |                              │  │
│  │   follow      friend                           │  │
│  │     |            |                              │  │
│  │   🤖 bot-2   🤖 agent-1                         │  │
│  │                                                 │  │
│  │  点击节点查看详情，拖拽移动，滚轮缩放             │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  关系统计                                              │
│  ┌──────────┬──────────┬──────────┬──────────┐       │
│  │  friend  │  follow  │  admin   │  member  │       │
│  │   12     │    8     │    3     │    2     │       │
│  └──────────┴──────────┴──────────┴──────────┘       │
└────────────────────────────────────────────────────────┘
```

**图谱交互：**
- ✅ 拖拽移动节点
- ✅ 滚轮缩放
- ✅ 点击查看详情
- ✅ 双击编辑关系
- ✅ 右键菜单操作
- ✅ 导出为图片

### 6. 权限管理页面

```
┌────────────────────────────────────────────────────────┐
│  权限管理                                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Tab: 权限检查 | 角色管理 | 权限配置]                 │
│                                                        │
│  ━━━ 权限检查 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                        │
│  源节点                                                │
│  ┌───────────────────────────────┐                    │
│  │ bot-1                     ▼  │                    │
│  └───────────────────────────────┘                    │
│                                                        │
│  目标节点                                              │
│  ┌───────────────────────────────┐                    │
│  │ user-1                    ▼  │                    │
│  └───────────────────────────────┘                    │
│                                                        │
│  操作                                                  │
│  ┌───────────────────────────────┐                    │
│  │ message:send              ▼  │                    │
│  └───────────────────────────────┘                    │
│                                                        │
│              [🔍 检查权限]                             │
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │  检查结果                                        │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  ✅ 允许                                         │ │
│  │                                                  │ │
│  │  匹配的权限规则:                                 │ │
│  │  • 关系权限: friend (bot-1 → user-1)            │ │
│  │  • 允许的操作: message:*, file:read             │ │
│  │                                                  │ │
│  │  关系详情:                                       │ │
│  │  • 类型: friend                                  │ │
│  │  • 建立时间: 2026-03-20 10:30:00                │ │
│  │  • 权限: message:send, message:receive          │ │
│  └─────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 7. 消息监控页面

```
┌────────────────────────────────────────────────────────┐
│  消息监控                          [▶️ 开始] [⏸️ 暂停] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  筛选: [节点 ▼] [类型 ▼]  搜索: [____________] 🔍      │
│                                                        │
│  实时消息流 (WebSocket)                               │
│  ┌────────────────────────────────────────────────────┐│
│  │ 10:25:30  bot-1  →  user-1   📨 文本消息          ││
│  │           "你好！有什么可以帮助你的吗？"            ││
│  │                                                    ││
│  │ 10:25:31  user-1  →  bot-1   📨 文本消息          ││
│  │           "我想查询今天的天气"                      ││
│  │                                                    ││
│  │ 10:25:32  bot-1  →  agent-1  📨 路由消息          ││
│  │           { "task": "weather", "location": "..." } ││
│  │                                                    ││
│  │ 10:25:33  agent-1  →  bot-1   📨 响应消息         ││
│  │           { "weather": "sunny", "temp": 25 }       ││
│  │                                                    ││
│  │ 10:25:34  bot-1  →  user-1   📨 文本消息          ││
│  │           "今天天气晴朗，温度25°C"                  ││
│  └────────────────────────────────────────────────────┘│
│                                                        │
│  [🧹 清空] [📥 导出] [📊 统计]                         │
└────────────────────────────────────────────────────────┘
```

---

## 🧩 UI 组件设计

### 1. 状态指示器组件

```typescript
<StatusIndicator 
  status="running" | "stopped" | "error" | "pending"
  text="运行中"
  pulse={true}
/>
```

**样式：**
- 🟢 `running` - 绿色脉冲动画
- 🟡 `pending` - 黄色闪烁
- 🔴 `stopped` - 红色静态
- ⚠️ `error` - 红色警告

### 2. 性能卡片组件

```typescript
<PerformanceCard
  title="CPU 使用率"
  value={12}
  unit="%"
  max={100}
  color="blue"
  trend="up" | "down" | "stable"
/>
```

### 3. 操作按钮组组件

```typescript
<ActionButtons
  actions={[
    { icon: 'play', text: '启动', onClick: handleStart },
    { icon: 'pause', text: '停止', onClick: handleStop },
    { icon: 'delete', text: '删除', danger: true, onClick: handleDelete }
  ]}
/>
```

### 4. 实时日志组件

```typescript
<LogViewer
  logs={logs}
  maxHeight={400}
  search={true}
  filter={true}
  autoScroll={true}
  highlightKeywords={['error', 'warning']}
/>
```

### 5. 关系图谱组件

```typescript
<RelationGraph
  nodes={nodes}
  relations={relations}
  onNodeClick={handleNodeClick}
  onRelationClick={handleRelationClick}
  layout="force" | "tree" | "radial"
  zoomable={true}
  draggable={true}
/>
```

---

## 🎨 设计系统

### 颜色方案

```yaml
主色:
  primary: "#1890ff"  # 蓝色
  success: "#52c41a"  # 绿色
  warning: "#faad14"  # 黄色
  error: "#ff4d4f"    # 红色
  info: "#1890ff"     # 信息蓝

中性色:
  text: "#262626"
  textSecondary: "#8c8c8c"
  border: "#d9d9d9"
  background: "#f0f2f5"
  white: "#ffffff"

节点类型色:
  bot: "#722ed1"      # 紫色
  user: "#1890ff"     # 蓝色
  agent: "#52c41a"    # 绿色
  service: "#fa8c16"  # 橙色
```

### 字体系统

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
             'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', 
             Helvetica, Arial, sans-serif;

字体大小:
  - xs: 12px
  - sm: 14px
  - base: 16px
  - lg: 18px
  - xl: 20px
  - 2xl: 24px
  - 3xl: 30px
```

### 间距系统

```css
spacing:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px
```

---

## 🔌 API 集成

### API 服务层

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// 实例管理 API
export const instanceAPI = {
  list: () => api.get('/instances'),
  get: (name: string) => api.get(`/instances/${name}`),
  create: (data: CreateInstanceDTO) => api.post('/instances', data),
  start: (name: string) => api.post(`/instances/${name}/start`),
  stop: (name: string) => api.post(`/instances/${name}/stop`),
  delete: (name: string) => api.delete(`/instances/${name}`),
};

// 节点管理 API
export const nodeAPI = {
  list: () => api.get('/nodes'),
  get: (id: string) => api.get(`/nodes/${id}`),
  create: (data: CreateNodeDTO) => api.post('/nodes', data),
  update: (id: string, data: UpdateNodeDTO) => api.put(`/nodes/${id}`, data),
  delete: (id: string) => api.delete(`/nodes/${id}`),
};
```

### WebSocket 集成

```typescript
// services/websocket.ts
import io from 'socket.io-client';

class WebSocketService {
  private socket: Socket;
  
  connect(url: string) {
    this.socket = io(url, {
      auth: { token: localStorage.getItem('token') }
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('message', (data) => {
      // 处理实时消息
    });
  }
  
  subscribe(event: string, callback: Function) {
    this.socket.on(event, callback);
  }
  
  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }
}

export default new WebSocketService();
```

---

## 📱 响应式设计

### 断点系统

```css
/* 移动设备 */
@media (max-width: 576px) { ... }

/* 平板设备 */
@media (min-width: 576px) and (max-width: 992px) { ... }

/* 桌面设备 */
@media (min-width: 992px) { ... }

/* 大屏设备 */
@media (min-width: 1200px) { ... }
```

### 移动端适配

- 侧边栏可收起
- 卡片布局变为单列
- 表格变为卡片列表
- 操作按钮变为底部固定栏

---

## 🚀 开发计划

### Phase 1: 基础框架（2周）

**目标：** 搭建基础框架和核心页面

- [ ] 项目初始化（React + TypeScript + Vite）
- [ ] 集成 Ant Design
- [ ] 路由配置
- [ ] API 服务层
- [ ] 状态管理（Zustand）
- [ ] 基础布局组件
  - [ ] Header
  - [ ] Sidebar
  - [ ] Content Layout
- [ ] 首页仪表盘
- [ ] 实例管理页面（列表、创建）

### Phase 2: 核心功能（3周）

**目标：** 完成核心功能开发

- [ ] 实例详情页面
  - [ ] 概览 Tab
  - [ ] 配置 Tab
  - [ ] 日志 Tab
- [ ] 节点管理页面
- [ ] 关系管理页面
  - [ ] 列表视图
  - [ ] 图谱视图（使用 G6 或 D3.js）
- [ ] 权限管理页面
- [ ] WebSocket 集成
- [ ] 实时更新功能

### Phase 3: 高级功能（2周）

**目标：** 完善高级功能和用户体验

- [ ] 消息监控页面
- [ ] 平台适配页面
- [ ] 系统设置页面
- [ ] 性能优化
  - [ ] 懒加载
  - [ ] 虚拟滚动
  - [ ] 缓存策略
- [ ] 错误处理和提示
- [ ] 加载状态优化
- [ ] 离线提示

### Phase 4: 优化和测试（1周）

**目标：** 测试和优化

- [ ] 单元测试
- [ ] E2E 测试
- [ ] 性能测试
- [ ] 浏览器兼容性测试
- [ ] 响应式测试
- [ ] 用户体验优化
- [ ] 文档编写

### Phase 5: 部署和发布（1周）

**目标：** 部署上线

- [ ] 生产环境构建
- [ ] Docker 镜像
- [ ] CI/CD 配置
- [ ] Nginx 配置
- [ ] HTTPS 证书
- [ ] 监控和日志
- [ ] 用户文档
- [ ] 发布说明

---

## 📦 项目结构

```
clawnet-web/
├── public/
│   ├── index.html
│   └── assets/
│       ├── logo.png
│       └── icons/
├── src/
│   ├── components/          # 组件
│   │   ├── common/          # 通用组件
│   │   │   ├── StatusIndicator.tsx
│   │   │   ├── PerformanceCard.tsx
│   │   │   └── ActionButtons.tsx
│   │   ├── layout/          # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Content.tsx
│   │   └── features/        # 功能组件
│   │       ├── InstanceCard.tsx
│   │       ├── NodeTable.tsx
│   │       └── RelationGraph.tsx
│   ├── pages/              # 页面
│   │   ├── Dashboard.tsx
│   │   ├── Instances.tsx
│   │   ├── InstanceDetail.tsx
│   │   ├── Nodes.tsx
│   │   ├── Relations.tsx
│   │   ├── Permissions.tsx
│   │   ├── Messages.tsx
│   │   ├── Adapters.tsx
│   │   └── Settings.tsx
│   ├── services/           # 服务层
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── storage.ts
│   ├── store/              # 状态管理
│   │   ├── useInstanceStore.ts
│   │   ├── useNodeStore.ts
│   │   └── useUIStore.ts
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useInstances.ts
│   │   ├── useNodes.ts
│   │   └── useWebSocket.ts
│   ├── utils/              # 工具函数
│   │   ├── request.ts
│   │   ├── format.ts
│   │   └── constants.ts
│   ├── types/              # TypeScript 类型
│   │   ├── instance.ts
│   │   ├── node.ts
│   │   └── relation.ts
│   ├── styles/             # 样式文件
│   │   ├── global.css
│   │   └── variables.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 安全考虑

### 认证和授权

```typescript
// JWT Token 管理
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// API 请求拦截
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### XSS 防护

- 使用 React 自动转义
- DOMPurify 清理用户输入
- CSP 头部配置

### CSRF 防护

- CSRF Token
- SameSite Cookie

---

## 📊 性能优化

### 代码分割

```typescript
// 路由级代码分割
const Instances = lazy(() => import('./pages/Instances'));
const Nodes = lazy(() => import('./pages/Nodes'));
const Relations = lazy(() => import('./pages/Relations'));
```

### 虚拟滚动

```typescript
import { List } from 'react-virtualized';

<List
  width={800}
  height={600}
  rowCount={nodes.length}
  rowHeight={50}
  rowRenderer={({ index, key, style }) => (
    <div key={key} style={style}>
      {nodes[index].name}
    </div>
  )}
/>
```

### 缓存策略

- React Query 缓存 API 响应
- LocalStorage 缓存配置
- Service Worker 离线支持

---

## 🧪 测试策略

### 单元测试

```typescript
// Jest + React Testing Library
describe('InstanceCard', () => {
  it('should render instance status correctly', () => {
    render(<InstanceCard instance={mockInstance} />);
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });
});
```

### E2E 测试

```typescript
// Cypress
describe('Instance Management', () => {
  it('should create a new instance', () => {
    cy.visit('/instances');
    cy.get('[data-testid="create-instance"]').click();
    cy.get('[data-testid="instance-name"]').type('test-bot');
    cy.get('[data-testid="submit"]').click();
    cy.contains('创建成功').should('be.visible');
  });
});
```

---

## 📖 文档和资源

### 开发文档

- [React 官方文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 指南](https://vitejs.dev/)

### 设计资源

- [Ant Design 设计语言](https://ant.design/docs/spec/introduce)
- [Material Design 指南](https://material.io/design)
- [AntV G6 图可视化](https://g6.antv.vision/)

---

## 🎯 成功指标

### 用户体验指标

- 首次内容绘制 (FCP): < 1.5s
- 最大内容绘制 (LCP): < 2.5s
- 首次输入延迟 (FID): < 100ms
- 累积布局偏移 (CLS): < 0.1

### 功能完成度

- ✅ 所有核心功能可用
- ✅ 响应式适配完成
- ✅ 测试覆盖率 > 80%
- ✅ 性能指标达标

---

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- ESLint + Prettier
- TypeScript 严格模式
- Git 提交规范 (Conventional Commits)

---

<div align="center">

**设计完成！准备开发 🚀**

</div>
