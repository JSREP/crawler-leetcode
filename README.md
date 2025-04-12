# LeetCode 爬虫挑战

[![部署GitHub Pages](https://github.com/JSREP/crawler-leetcode/actions/workflows/deploy-github-pages.yml/badge.svg)](https://github.com/JSREP/crawler-leetcode/actions/workflows/deploy-github-pages.yml)

这个仓库收集了各种网站的爬虫挑战案例，展示了不同类型的反爬虫技术和解决方案。项目使用React+TypeScript开发，通过GitHub Pages进行部署。

**在线访问**: [https://jsrep.github.io/crawler-leetcode/](https://jsrep.github.io/crawler-leetcode/)

## 项目结构

```
crawler-leetcode/
├── .github/             # GitHub相关配置
│   └── workflows/       # GitHub Actions工作流配置
├── docs/                # 文档和挑战定义
│   └── challenges/      # 爬虫挑战YAML定义文件
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── components/      # React组件
│   ├── pages/           # 页面组件
│   ├── plugins/         # 项目插件
│   ├── utils/           # 工具函数
│   └── App.tsx          # 应用入口
├── package.json         # 项目依赖
└── vite.config.ts       # Vite配置
```

## 爬虫挑战

所有爬虫挑战都定义在 `docs/challenges/` 目录中，使用YAML格式描述挑战的特点、难度和解决方案。详细的贡献指南请参考 [挑战贡献指南](docs/challenges/README.md)。

目前包含的挑战类型：

- 验证码挑战（如reCAPTCHA、hCaptcha）
- 浏览器指纹识别
- JavaScript混淆与加密
- API限流与保护
- WebAssembly保护
- 设备指纹和行为分析

## 本地开发

```bash
# 克隆项目
git clone https://github.com/JSREP/crawler-leetcode.git
cd crawler-leetcode

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 自动部署

本项目配置了GitHub Actions自动部署流程，当代码推送到主分支时，会自动构建并部署到GitHub Pages：

1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 构建项目
5. 部署到gh-pages分支

你可以在 `.github/workflows/deploy-github-pages.yml` 文件中查看完整的工作流配置。

## 贡献指南

1. Fork本仓库
2. 创建新分支 (`git checkout -b feature/new-challenge`)
3. 提交更改 (`git commit -m 'Add new challenge: XXX'`)
4. 推送到分支 (`git push origin feature/new-challenge`)
5. 创建Pull Request

欢迎贡献新的爬虫挑战案例、改进文档或代码！

## 许可证

MIT
