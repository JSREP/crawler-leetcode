# 爬虫LeetCode项目 - 前端应用

这是爬虫LeetCode项目的前端应用，基于Next.js构建的纯客户端应用。

## 🏗️ 架构概述

### 前后端分离架构
- **前端**: Next.js 14 + TypeScript + Ant Design (纯客户端应用)
- **后端**: Python Flask + MySQL (独立API服务)
- **通信**: RESTful API + JWT认证

### 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI库**: Ant Design 5.x
- **样式**: Tailwind CSS
- **状态管理**: React Context + Hooks
- **HTTP客户端**: Fetch API (封装)
- **构建**: 静态导出 (Static Export)

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.local.example .env.local
```

2. 编辑 `.env.local` 文件：
```env
# Flask后端API地址
NEXT_PUBLIC_API_URL=http://localhost:5000

# GitHub OAuth客户端ID
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

### 开发模式
```bash
npm run dev
```
应用将在 http://localhost:3000 启动

### 生产构建
```bash
# 构建静态文件
npm run build

# 本地预览
npm run serve
```

## 📁 项目结构

```
frontend/
├── app/                    # Next.js App Router页面
│   ├── (auth)/            # 认证相关页面
│   ├── challenges/        # 挑战页面
│   ├── forum/             # 论坛页面
│   ├── profile/           # 用户资料页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── auth/              # 认证组件
│   ├── challenges/        # 挑战组件
│   ├── forum/             # 论坛组件
│   ├── layout/            # 布局组件
│   └── ui/                # 通用UI组件
├── contexts/              # React上下文
│   └── AuthContext.tsx    # 认证上下文
├── lib/                   # 工具库
│   ├── api-client.ts      # API客户端
│   └── utils.ts           # 工具函数
├── styles/                # 样式文件
├── public/                # 静态资源
└── types/                 # TypeScript类型定义
```

## 🔌 API集成

### API客户端
项目使用封装的API客户端与Flask后端通信：

```typescript
import { api } from '@/lib/api-client';

// 获取挑战列表
const challenges = await api.db.getChallenges({ page: '1', per_page: '10' });

// 用户登录
await api.auth.githubLogin(code);

// 上传文件
const formData = new FormData();
formData.append('file', file);
await api.storage.upload(formData);
```

### 认证流程
1. 用户点击GitHub登录
2. 重定向到GitHub OAuth
3. 获取授权码后调用后端API
4. 后端返回JWT令牌
5. 前端保存令牌并设置API客户端

### 错误处理
API客户端自动处理常见错误：
- 网络错误
- HTTP状态码错误
- JWT令牌过期自动刷新
- 统一错误格式

## 🎨 UI组件

### 设计系统
- 基于Ant Design组件库
- 自定义主题配置
- 响应式设计
- 暗色模式支持

### 组件规范
- 使用TypeScript严格类型检查
- Props接口定义
- 默认值和文档注释
- 单元测试覆盖

## 🔐 认证与授权

### 认证状态管理
使用React Context管理全局认证状态：

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginButton onClick={() => login(code)} />;
  }
  
  return <UserProfile user={user} onLogout={logout} />;
}
```

### 路由保护
- 公开路由：首页、挑战列表、挑战详情
- 受保护路由：用户资料、论坛发帖、文件上传
- 管理员路由：用户管理、系统设置

## 📱 响应式设计

### 断点配置
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 适配策略
- 移动优先设计
- 弹性布局
- 图片自适应
- 触摸友好的交互

## 🚀 部署

### 静态部署
项目支持静态导出，可部署到任何静态托管服务：

```bash
# 构建静态文件
npm run build

# 部署 out/ 目录到静态托管服务
```

### 支持的平台
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- 任何支持静态文件的服务器

### 环境变量
生产环境需要配置：
- `NEXT_PUBLIC_API_URL`: 后端API地址
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`: GitHub OAuth客户端ID

## 🔧 开发工具

### 代码质量
- ESLint: 代码规范检查
- Prettier: 代码格式化
- TypeScript: 类型检查
- Husky: Git钩子

### 调试工具
- React DevTools
- Network面板监控API调用
- Console日志
- Source Map支持

## 📚 开发指南

### 添加新页面
1. 在 `app/` 目录创建路由文件
2. 实现页面组件
3. 添加必要的类型定义
4. 更新导航菜单

### 添加新API
1. 在 `lib/api-client.ts` 添加API方法
2. 定义请求/响应类型
3. 添加错误处理
4. 更新相关组件

### 样式开发
1. 优先使用Ant Design组件
2. 使用Tailwind CSS工具类
3. 自定义样式放在 `styles/` 目录
4. 保持设计一致性

## 🐛 故障排除

### 常见问题

1. **API调用失败**
   - 检查后端服务是否启动
   - 验证API_URL配置
   - 查看网络面板错误信息

2. **认证问题**
   - 清除浏览器本地存储
   - 检查JWT令牌是否过期
   - 验证GitHub OAuth配置

3. **构建错误**
   - 检查TypeScript类型错误
   - 验证环境变量配置
   - 清除 `.next` 缓存目录

### 日志调试
开发模式下启用详细日志：
```typescript
// 在 .env.local 中设置
NEXT_PUBLIC_DEBUG=true
```

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件
