# 挑战数据模拟生成器

此脚本用于生成模拟挑战数据，可用于开发和测试环境。生成的数据包含随机的挑战信息、Markdown描述内容和相关图片资源。

## 功能特点

- 生成随机挑战基本信息（标题、难度、标签、平台等）
- 支持两种描述模式：
  - 内联Markdown（`description-markdown`字段）
  - 外部Markdown文件（`description-markdown-path`字段）
- 自动创建配套图片资源（漏洞分布图、代码示例截图等）
- 随机生成结构化的Markdown内容，包含标题、描述、任务、代码示例等
- 支持配置生成数量

## 运行环境要求

- Node.js 14.0+
- 依赖包：
  - @faker-js/faker: 用于生成随机数据
  - js-yaml: 用于YAML文件处理

## 使用方法

1. 确保已安装所需依赖：

```bash
cd scripts
npm install
```

2. 运行脚本生成数据：

```bash
node generate-mock-data.js
```

## 生成数据结构

### YAML格式挑战文件

生成的YAML文件包含以下字段：

```yaml
id: 唯一标识符
number: 挑战编号
title: 挑战标题
tags: 标签列表
platform: 平台名称
difficulty-level: 难度等级(1-5)
external-link: 外部链接
is-expired: 是否过期
solutions: 解决方案列表
create-time: 创建时间
update-time: 更新时间
# 以下两者二选一
description-markdown: 内联Markdown内容
description-markdown-path: 外部Markdown文件路径
```

### Markdown内容结构

生成的Markdown内容包含以下部分：

- 标题和描述
- 安全漏洞分布（可能包含图片）
- 任务列表
- 代码示例（多种编程语言）
- 提示和注意事项
- 图片引用

## 目录结构

生成的文件将保存在以下位置：

- YAML文件：`docs/challenges/mock_data/`
- Markdown文件：`docs/challenges/markdown/challenge_[id]/description.md`
- 图片资源：`docs/challenges/markdown/challenge_[id]/images/`

## 自定义配置

如需修改生成数量或其他参数，请编辑`generate-mock-data.js`文件中的`main`函数：

```javascript
function main() {
  // 修改此处的挑战数量
  const challengeCount = 30;
  const challenges = generateMockData(challengeCount);
  // ...
}
``` 