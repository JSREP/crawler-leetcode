# 本地存储系统文档

## 📋 概述

本地存储系统是爬虫LeetCode项目的文件管理核心，提供安全、高效的文件存储和管理功能。

### 主要特性
- 🗂️ 分类存储管理
- 📊 存储配额控制
- 🖼️ 自动缩略图生成
- 🔒 安全访问控制
- 🧹 自动清理机制
- 💾 备份与恢复
- 📈 使用统计分析

## 🏗️ 架构设计

### 目录结构
```
storage/
├── uploads/          # 用户上传文件
├── avatars/          # 用户头像
├── challenges/       # 挑战相关文件
├── temp/             # 临时文件
├── backups/          # 备份文件
└── storage.conf      # 配置文件
```

### 数据库模型
- **UserStorage**: 文件记录表
- **UserStorageQuota**: 用户配额表

### API端点
- `POST /storage/upload` - 文件上传
- `POST /storage/upload/avatar` - 头像上传
- `GET /storage/files/<path>` - 文件访问
- `GET /storage/quota` - 配额查询
- `DELETE /storage/files/<id>` - 文件删除

## 🚀 快速开始

### 1. 初始化存储系统
```bash
cd backend
python scripts/setup_storage.py
```

### 2. 配置环境变量
```env
# .env 文件
UPLOAD_FOLDER=./storage
MAX_CONTENT_LENGTH=16777216  # 16MB
```

### 3. 启动Flask应用
```bash
python run.py
```

## 📁 文件管理

### 文件上传
```python
# 使用API客户端
from app.api import api

# 上传文件
with open('file.jpg', 'rb') as f:
    files = {'file': f}
    data = {'purpose': 'avatar', 'category': 'avatars'}
    response = api.storage.upload(files, data)
```

### 文件访问
```
GET /storage/files/avatars/avatar_123_20231201_120000_abc123.jpg
GET /storage/files/uploads/document_20231201_120000_def456.pdf?download=true
GET /storage/files/uploads/image_20231201_120000_ghi789.jpg?thumbnail=true
```

### 文件删除
```python
# 软删除（标记为已删除）
api.storage.delete_file(file_id)

# 物理删除（通过维护脚本）
python scripts/storage_maintenance.py cleanup
```

## 💾 存储配额

### 默认配额
- 新用户: 100MB
- 管理员: 无限制

### 配额管理
```python
# 查询配额
quota_info = api.storage.get_quota()

# 购买额外空间
api.storage.purchase_storage({'storage_gb': 5})

# 获取使用统计
stats = api.storage.get_stats()
```

### 配额计算
- 实时计算已用空间
- 支持购买额外配额
- 自动清理释放空间

## 🖼️ 图片处理

### 缩略图生成
- 自动为图片生成200x200缩略图
- 支持JPEG、PNG、GIF格式
- 优化压缩，质量85%

### 头像处理
- 自动裁剪为正方形
- 调整到256x256像素
- 替换旧头像文件

## 🔒 安全机制

### 文件类型验证
```python
ALLOWED_EXTENSIONS = {
    'png', 'jpg', 'jpeg', 'gif', 'webp',  # 图片
    'pdf', 'txt', 'md',                   # 文档
}
```

### 路径安全
- 防止目录遍历攻击
- 文件名安全化处理
- 访问权限验证

### 大小限制
- 单文件最大16MB
- 用户配额限制
- 上传速率限制

## 🧹 维护管理

### 自动维护脚本
```bash
# 完整维护
python scripts/storage_maintenance.py full

# 清理孤立文件
python scripts/storage_maintenance.py cleanup

# 生成缺失缩略图
python scripts/storage_maintenance.py thumbnails

# 查看统计信息
python scripts/storage_maintenance.py stats
```

### 定期任务设置
```bash
# 添加到crontab
0 2 * * * cd /path/to/project && python scripts/storage_maintenance.py full
0 * * * * cd /path/to/project && python scripts/storage_maintenance.py cleanup
```

### 维护内容
- 清理孤立文件
- 删除已标记文件
- 更新配额统计
- 生成缺失缩略图
- 清理临时文件

## 💾 备份与恢复

### 创建备份
```bash
# 创建完整备份
python scripts/storage_backup.py create

# 创建命名备份
python scripts/storage_backup.py create "backup_before_migration"
```

### 恢复备份
```bash
# 恢复指定备份
python scripts/storage_backup.py restore storage_backup_20231201_120000.tar.gz
```

### 备份管理
```bash
# 列出所有备份
python scripts/storage_backup.py list

# 清理30天前的备份
python scripts/storage_backup.py cleanup 30
```

### 备份内容
- 所有用户文件
- 数据库记录
- 配置信息
- 元数据

## 📊 监控与统计

### 存储统计
```python
# 获取详细统计
stats = api.storage.get_stats()

# 统计内容
{
    'quota': {...},           # 配额信息
    'usage_by_purpose': [...], # 按用途统计
    'usage_by_type': [...],   # 按类型统计
}
```

### 性能监控
- 文件上传速度
- 存储空间使用率
- API响应时间
- 错误率统计

## 🔧 配置选项

### 环境变量
```env
# 存储根目录
UPLOAD_FOLDER=./storage

# 文件大小限制
MAX_CONTENT_LENGTH=16777216

# 允许的文件类型
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,pdf,txt,md

# 缩略图设置
THUMBNAIL_SIZE=200
THUMBNAIL_QUALITY=85
```

### 运行时配置
```python
# config.py
class Config:
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or './storage'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'md'}
```

## 🚀 性能优化

### 文件服务优化
- 使用Nginx提供静态文件服务
- 启用gzip压缩
- 设置适当的缓存头
- CDN加速（可选）

### 存储优化
- 定期清理无用文件
- 压缩历史文件
- 分层存储策略
- 自动归档机制

### 数据库优化
- 文件路径索引
- 用户ID索引
- 定期清理删除记录
- 统计信息缓存

## 🐛 故障排除

### 常见问题

1. **文件上传失败**
   - 检查文件大小限制
   - 验证文件类型
   - 确认存储配额
   - 检查目录权限

2. **缩略图生成失败**
   - 安装Pillow库
   - 检查图片格式
   - 验证目录权限
   - 查看错误日志

3. **配额计算错误**
   - 运行配额更新脚本
   - 检查数据库一致性
   - 清理孤立记录
   - 重新计算统计

### 日志分析
```bash
# 查看Flask日志
tail -f logs/flask.log

# 查看维护日志
tail -f /var/log/storage-maintenance.log

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log
```

## 📚 API参考

### 文件上传API
```http
POST /storage/upload
Content-Type: multipart/form-data

file: <binary>
purpose: string (optional)
category: string (optional)
```

### 文件访问API
```http
GET /storage/files/<path>
?download=true    # 强制下载
?thumbnail=true   # 获取缩略图
```

### 配额管理API
```http
GET /storage/quota
POST /storage/quota/purchase
GET /storage/quota/stats
```

## 🔮 未来规划

### 功能扩展
- 文件版本控制
- 在线预览功能
- 批量操作支持
- 文件分享链接
- 水印添加功能

### 性能提升
- 分布式存储支持
- 对象存储集成
- 智能缓存策略
- 异步处理优化

### 安全增强
- 文件内容扫描
- 病毒检测集成
- 访问日志审计
- 权限细粒度控制
