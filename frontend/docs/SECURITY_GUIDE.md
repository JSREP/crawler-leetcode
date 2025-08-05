# 🔒 安全配置指南

本文档提供项目的安全配置最佳实践，确保敏感信息不会被意外泄露。

## 🚨 重要安全原则

### 1. 环境变量文件安全

#### ✅ 正确的做法
- **`.env.local`** - 包含真实的敏感信息，**绝不**提交到git
- **`.env.example`** - 只包含示例占位符，**可以**提交到git
- **`.gitignore`** - 确保所有敏感文件都被正确忽略

#### ❌ 错误的做法
- 将真实的数据库密码、API密钥放入`.env.example`
- 提交包含敏感信息的环境变量文件
- 在代码中硬编码敏感信息

### 2. 文件分类

| 文件名 | 用途 | 是否提交到git | 内容类型 |
|--------|------|---------------|----------|
| `.env.local` | 本地开发环境配置 | ❌ 否 | 真实敏感信息 |
| `.env.example` | 配置示例模板 | ✅ 是 | 脱敏示例值 |
| `.env.production` | 生产环境配置 | ❌ 否 | 生产环境敏感信息 |
| `.env.test` | 测试环境配置 | ❌ 否 | 测试环境配置 |

## 🛡️ 敏感信息类型

### 数据库凭据
```env
# ❌ 错误 - 真实凭据
DATABASE_URL="postgres://user:real_password@real-host.neon.tech/db"

# ✅ 正确 - 示例占位符
DATABASE_URL="postgres://your_username:your_password@your-host.neon.tech/your_database"
```

### API密钥和令牌
```env
# ❌ 错误 - 真实密钥
BLOB_READ_WRITE_TOKEN="vercel_blob_0_abc123def456..."
STACK_SECRET_SERVER_KEY="ssk_real_secret_key_here"

# ✅ 正确 - 占位符
BLOB_READ_WRITE_TOKEN="your_blob_read_write_token"
STACK_SECRET_SERVER_KEY="your-stack-secret-server-key"
```

### 项目ID和标识符
```env
# ❌ 错误 - 真实ID
NEXT_PUBLIC_STACK_PROJECT_ID="698031fc-cc81-485e-9359-aa5e3f6657ae"

# ✅ 正确 - 占位符
NEXT_PUBLIC_STACK_PROJECT_ID="your-stack-project-id"
```

## 📋 安全检查清单

### 提交前检查
- [ ] 检查`.env.example`中是否包含真实敏感信息
- [ ] 确认`.env.local`在`.gitignore`中
- [ ] 验证所有密码、密钥都是占位符
- [ ] 检查代码中是否有硬编码的敏感信息

### 定期安全审查
- [ ] 定期检查git历史中是否意外提交了敏感信息
- [ ] 更新过期的API密钥和令牌
- [ ] 审查团队成员的访问权限
- [ ] 监控异常的数据库访问

## 🔧 配置步骤

### 1. 初始化本地环境
```bash
# 复制示例配置文件
cp .env.example .env.local

# 编辑本地配置文件，填入真实信息
nano .env.local
```

### 2. 配置数据库连接
```env
# 在 .env.local 中配置真实的Neon数据库信息
DATABASE_URL="postgres://your_real_username:your_real_password@your-real-host.neon.tech/your_real_database?sslmode=require"
```

### 3. 配置文件存储
```env
# 在 .env.local 中配置真实的Vercel Blob Store令牌
BLOB_READ_WRITE_TOKEN="your_real_blob_token_here"
```

## 🚨 应急响应

### 如果意外泄露敏感信息

#### 立即行动
1. **立即更改**所有泄露的密码和密钥
2. **撤销**相关的API令牌和访问权限
3. **通知**团队成员和相关服务提供商

#### Git历史清理
```bash
# 如果敏感信息已提交，需要重写历史记录
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送清理后的历史
git push origin --force --all
```

#### 服务商通知
- **Neon**: 立即更改数据库密码
- **Vercel**: 撤销并重新生成Blob Store令牌
- **GitHub**: 重新生成OAuth App的Client Secret

## 🛠️ 开发工具

### Git Hooks
创建预提交钩子检查敏感信息：
```bash
#!/bin/sh
# .git/hooks/pre-commit
if grep -r "npg_\|github_client_secret" .env.example; then
    echo "❌ 检测到敏感信息在.env.example中！"
    exit 1
fi
```

### IDE配置
- 配置编辑器高亮显示敏感模式
- 使用插件检测硬编码的密钥
- 设置文件模板避免错误

## 📚 相关资源

- [OWASP安全编码实践](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [GitHub安全最佳实践](https://docs.github.com/en/code-security)
- [Vercel环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon安全指南](https://neon.tech/docs/security)

## 🆘 联系方式

如果发现安全问题或需要帮助：
- 📧 安全邮箱: security@yourproject.com
- 🐛 GitHub Issues: [项目安全问题](https://github.com/JSREP/crawler-leetcode/issues)
- 📱 紧急联系: 项目维护者

---

**记住**: 安全是每个人的责任！🔐
