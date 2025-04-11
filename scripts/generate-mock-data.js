import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { faker } from '@faker-js/faker';

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置中文语言
faker.locale = 'zh_CN';

// 确保目录存在
const mockDataDir = path.join(__dirname, '../docs/challenges/mock_data');
if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir, { recursive: true });
}

// 可能的标签列表
const possibleTags = [
  'XSS', 'CSRF', 'SQL-Injection', 'Authentication', 'Authorization',
  'Rate-Limiting', 'Input-Validation', 'Output-Encoding', 'HTTP-Headers',
  'Session-Management', 'CORS', 'OAuth', 'JWT', 'API-Security', 'File-Upload',
  'XXE', 'SSRF', 'Security-Headers', 'DOM-Based', 'Reflected-XSS',
  'Stored-XSS', 'Clickjacking', 'CSP', 'HTTPS', 'Cookie-Security',
  'Insecure-Deserialization', 'Prototype-Pollution', 'Path-Traversal',
  'Command-Injection', 'Weak-Cryptography'
];

// 可能的平台
const possiblePlatforms = [
  'Web', 'Mobile', 'Desktop', 'IoT', 'Cloud', 'API', 'Backend',
  'Frontend', 'Full-Stack', 'Android', 'iOS', 'Windows', 'Linux',
  'macOS', 'AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Serverless'
];

// 示例Markdown内容
const mockMarkdownContent = `
# 挑战题目详细说明

这是通过脚本生成的模拟挑战描述。解决此挑战需要了解相关的安全概念和技术。

## 问题背景

在一个典型的应用程序中，可能存在各种安全漏洞。下面是示例代码片段：

\`\`\`javascript
function processUserInput(input) {
  // 没有进行适当的输入验证和过滤
  document.getElementById('output').innerHTML = input;
  
  // 潜在的SQL注入
  let query = "SELECT * FROM users WHERE username = '" + input + "'";
  
  return executeQuery(query);
}
\`\`\`

## 漏洞分析

上述代码存在以下安全问题：

1. **XSS漏洞** - 直接将用户输入插入到DOM中
2. **SQL注入** - 未使用参数化查询
3. **缺乏输入验证** - 没有检查和过滤用户输入

## 解决方案

请提交一个修复上述问题的代码实现。
`;

// 生成随机数据
function generateChallenge(id) {
  const randomTags = [];
  const tagCount = faker.number.int({ min: 2, max: 5 });
  for (let i = 0; i < tagCount; i++) {
    const randomTag = possibleTags[faker.number.int({ min: 0, max: possibleTags.length - 1 })];
    if (!randomTags.includes(randomTag)) {
      randomTags.push(randomTag);
    }
  }

  const randomPlatform = possiblePlatforms[faker.number.int({ min: 0, max: possiblePlatforms.length - 1 })];
  
  // 随机生成1-5的难度星级
  const difficultyLevel = faker.number.int({ min: 1, max: 5 });
  
  // 随机生成1-3个解决方案
  const solutionsCount = faker.number.int({ min: 1, max: 3 });
  const solutions = [];
  
  for (let i = 0; i < solutionsCount; i++) {
    const solution = {
      title: faker.lorem.sentence(3),
      url: faker.internet.url(),
      source: faker.helpers.arrayElement(['GitHub', 'StackOverflow', 'YouTube', 'Medium', 'Blog', 'Documentation']),
      author: faker.datatype.boolean() ? faker.person.fullName() : ''
    };
    solutions.push(solution);
  }
  
  const challenge = {
    id,
    'id-alias': `mock-challenge-${id}`,
    tags: randomTags,
    platform: randomPlatform,
    name: `Mock挑战题目 #${id}`,
    'difficulty-level': difficultyLevel,
    // 移除description字段
    'description-markdown': mockMarkdownContent,
    'base64-url': faker.helpers.fromRegExp(/aHR0cHM6Ly9jaGFsbGVuZ2UuZG9tYWluLmNvbS9xdWl6L[A-Za-z0-9]{8}/),
    'is-expired': faker.datatype.boolean({ probability: 0.2 }), // 20%概率为过期
    solutions,
    'create-time': faker.date.past({ years: 1 }).toISOString().split('T')[0] + ' ' + faker.date.recent().toISOString().split('T')[1].substring(0, 8),
    'update-time': faker.date.recent().toISOString().split('T')[0] + ' ' + faker.date.recent().toISOString().split('T')[1].substring(0, 8)
  };
  
  return challenge;
}

// 生成YAML文件
function generateYamlFile(id) {
  const challenge = generateChallenge(id);
  const yamlContent = yaml.dump({
    version: 1,
    challenges: [challenge]
  }, { lineWidth: -1 });
  
  const filePath = path.join(mockDataDir, `challenge_${id}.yml`);
  fs.writeFileSync(filePath, `# 挑战题目文件\n${yamlContent}`);
  console.log(`Generated: challenge_${id}.yml`);
}

// 生成1000个mock数据
function generateAllMockData() {
  console.log('开始生成mock数据...');
  for (let i = 1; i <= 1000; i++) {
    generateYamlFile(i);
  }
  console.log('所有mock数据生成完成！');
}

generateAllMockData(); 