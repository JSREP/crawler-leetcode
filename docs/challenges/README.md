# 爬虫挑战合集贡献指南

本目录收集了各种网站的爬虫挑战，每个挑战都描述了一个特定网站的反爬机制和技术细节。如果你希望贡献新的挑战，请按照以下指南操作。

## 目录结构

```
docs/challenges/
├── README.md           # 本文件：贡献指南
├── meta.yml            # 示例和元数据格式说明
├── Challenge Name 1.yml # 挑战1的YAML文件
├── Challenge Name 2.yml # 挑战2的YAML文件
└── ...                 # 更多挑战文件
```

## 如何贡献新挑战

1. 每个爬虫挑战需要保存为一个单独的YAML文件
2. 文件名应该与挑战名称一致，例如：`Akamai Bot Manager.yml`
3. 确保你的YAML文件符合以下格式规范

## YAML文件结构

每个挑战YAML文件必须包含以下基本格式：

```yaml
version: 1
challenges:
  - id: <唯一ID>
    # 其他字段...
```

### 必填字段

- `version`: 数据结构版本，目前固定为1
- `challenges`: 包含单个挑战信息的数组（即使只有一个挑战）
  - `id`: 挑战的唯一ID（整数）
  - `id-alias`: ID的别名，用于URL和引用（字符串）
  - `platform`: 平台类型，目前支持：Web、Android、iOS
  - `name`: 挑战名称（中文）
  - `difficulty-level`: 难度级别（1-5，整数）
  - `description-markdown` 或 `description-markdown-path`: 挑战描述（选其一）
  - `base64-url`: 目标网站URL的base64编码
  - `is-expired`: 链接是否已失效（布尔值）
  - `create-time`: 创建时间（格式：YYYY-MM-DD HH:mm:ss）
  - `update-time`: 更新时间（格式：YYYY-MM-DD HH:mm:ss）

### 可选字段

- `name_en`: 挑战英文名称
- `tags`: 标签数组，如 ['js-reverse', 'wasm', 'jsvmp']
- `description-markdown_en` 或 `description-markdown-path_en`: 英文描述
- `solutions`: 解决方案数组，每个解决方案包含title、url、source和author字段

## 挑战描述建议

描述应包含以下内容：
1. 简单介绍目标网站的功能和特点
2. 详细描述其反爬机制和技术特点
3. 可能的难点和解决思路
4. 尽量客观描述，避免主观评价
5. 可以使用Markdown语法增强可读性

## 完整示例

```yaml
version: 1
challenges:
  - id: 12
    id-alias: akamai-bot
    tags:
      - browser-fingerprint
      - behavior-analysis
    platform: Web
    name: Akamai Bot Manager
    name_en: Akamai Bot Manager
    difficulty-level: 5
    description-markdown: |
      Akamai Bot Manager是一种高级反爬虫解决方案，使用多层防护机制识别和阻止自动化流量。
      
      特点：
      - 设备指纹识别：收集浏览器、系统和硬件特征
      - 行为分析：监控鼠标移动、点击模式和导航行为
      - 机器学习：基于历史数据识别异常行为
      
      破解难点：
      - 需要准确模拟真实用户的浏览器环境
      - 必须生成逼真的人类行为模式
      - 要应对动态变化的检测算法
    base64-url: aHR0cHM6Ly93d3cuYWthbWFpLmNvbS8=
    is-expired: false
    create-time: 2025-03-01 00:00:01
    update-time: 2025-03-01 00:00:01
```

## 提交流程

1. Fork本仓库
2. 创建新分支: `git checkout -b add-new-challenge`
3. 添加你的挑战YAML文件到`docs/challenges/`目录
4. 提交修改: `git commit -m "Add new challenge: XXX"`
5. 推送到你的Fork: `git push origin add-new-challenge`
6. 创建Pull Request

## 注意事项

- 确保提供的URL是合法的，且不涉及违法内容
- 描述应客观准确，不包含主观评价或不恰当内容
- 日期格式必须符合：`YYYY-MM-DD HH:mm:ss`
- 在提交前请验证YAML格式是否正确

感谢你对爬虫挑战合集的贡献！
