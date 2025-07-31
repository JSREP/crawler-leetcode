# Vercel Blob Store 集成文档

本项目已集成 Vercel Blob Store 对象存储服务，提供高性能的文件上传和存储功能。

## 功能特性

- ✅ **多文件类型支持**: 图片、文档、压缩包
- ✅ **自动文件分类**: 按类型自动组织文件结构
- ✅ **全球CDN加速**: Vercel全球边缘网络
- ✅ **安全上传**: 文件类型和大小验证
- ✅ **实时预览**: 图片文件支持即时预览
- ✅ **响应式UI**: 适配各种设备屏幕

## 环境配置

### 1. 安装依赖

```bash
npm install @vercel/blob
```

### 2. 环境变量配置

在 `.env.local` 文件中添加：

```env
BLOB_READ_WRITE_TOKEN="your_blob_read_write_token"
```

### 3. Vercel项目连接

1. 在 Vercel Dashboard 中连接项目到 Blob Store
2. 运行 `vercel link` 连接本地项目
3. 运行 `vercel env pull` 拉取环境变量

## API接口

### 通用文件上传

**端点**: `POST /api/upload`

**查询参数**:
- `filename` (必需): 文件名
- `category` (可选): 文件分类 (general, avatars, challenges, documents)
- `type` (可选): 文件类型 (image, document, archive)

**示例**:
```javascript
const response = await fetch(
  `/api/upload?filename=${encodeURIComponent(file.name)}&category=demo&type=image`,
  {
    method: 'POST',
    body: file,
  }
);
```

### 头像上传

**端点**: `POST /api/avatar/upload`

**查询参数**:
- `filename` (必需): 文件名

**示例**:
```javascript
const response = await fetch(
  `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
  {
    method: 'POST',
    body: file,
  }
);
```

### 配置信息

**端点**: `GET /api/upload`

返回当前上传配置信息，包括文件大小限制、支持的文件类型等。

## React组件

### FileUpload 组件

通用文件上传组件，支持多种文件类型和自定义配置。

```tsx
import FileUpload from '@/components/upload/FileUpload';

<FileUpload
  category="demo"
  fileType="image"
  maxSize={4.5}
  onUploadSuccess={(result) => console.log('上传成功:', result)}
  onUploadError={(error) => console.error('上传失败:', error)}
/>
```

**属性**:
- `category`: 文件分类
- `fileType`: 文件类型 ('image' | 'document' | 'archive')
- `maxSize`: 最大文件大小 (MB)
- `onUploadSuccess`: 上传成功回调
- `onUploadError`: 上传失败回调

### AvatarUpload 组件

专门的头像上传组件，提供实时预览功能。

```tsx
import AvatarUpload from '@/components/upload/AvatarUpload';

<AvatarUpload
  defaultAvatar="/default-avatar.png"
  onUploadSuccess={(result) => console.log('头像上传成功:', result)}
  onUploadError={(error) => console.error('头像上传失败:', error)}
/>
```

## 文件限制

### 大小限制
- **服务器上传**: 最大 4.5MB
- **客户端上传**: 最大 500MB (需要额外配置)

### 支持的文件类型

**图片文件**:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

**文档文件**:
- PDF (.pdf)
- 纯文本 (.txt)
- JSON (.json)

**压缩文件**:
- ZIP (.zip)
- TAR (.tar)

## 文件组织结构

上传的文件按以下结构自动组织：

```
blob-store/
├── general/          # 通用文件
├── avatars/          # 用户头像
├── challenges/       # 挑战相关文件
├── documents/        # 文档文件
└── demo/            # 演示文件
```

每个文件名格式：`{timestamp}-{randomId}.{extension}`

## 安全考虑

1. **文件类型验证**: 严格验证MIME类型
2. **文件大小限制**: 防止大文件攻击
3. **文件名处理**: 自动生成唯一文件名
4. **访问控制**: 所有文件默认公开访问

## 演示页面

访问 `/upload` 页面查看完整的上传功能演示，包括：
- 通用文件上传
- 头像上传
- 文档上传
- 实时预览和管理

## 故障排除

### 常见问题

1. **上传失败 - "Blob storage not configured"**
   - 检查 `BLOB_READ_WRITE_TOKEN` 环境变量是否正确配置

2. **文件类型不支持**
   - 检查文件MIME类型是否在允许列表中

3. **文件过大**
   - 确保文件大小不超过4.5MB限制

4. **网络错误**
   - 检查网络连接和Vercel服务状态

### 调试技巧

1. 检查浏览器开发者工具的网络面板
2. 查看服务器日志中的错误信息
3. 使用 `GET /api/upload` 检查配置状态

## 更多资源

- [Vercel Blob 官方文档](https://vercel.com/docs/storage/vercel-blob)
- [Next.js 文件上传最佳实践](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#request-body)
- [项目GitHub仓库](https://github.com/JSREP/crawler-leetcode)
