import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 平台选项
const platforms = ['Web', 'Android', 'iOS'];

// 标签选项
const allTags = [
  'js-reverse', 'wasm', 'jsvmp', 'obfuscator', 'webpack', 
  'api-protection', 'anti-debug', 'anti-crawler', 'signature', 
  'encryption', 'fingerprint', 'browser-check', 'mobile-app', 
  'canvas-fingerprint', 'webgl-fingerprint', 'device-motion',
  'cookie-protection', 'token-validation', 'rate-limiting'
];

// 生成随机标签数组
function getRandomTags() {
  const count = Math.floor(Math.random() * 4) + 1; // 1-4个标签
  const tags = [];
  const availableTags = [...allTags];
  
  for (let i = 0; i < count; i++) {
    if (availableTags.length === 0) break;
    const index = Math.floor(Math.random() * availableTags.length);
    tags.push(availableTags[index]);
    availableTags.splice(index, 1);
  }
  
  return tags;
}

// 生成随机的base64 URL
function getRandomBase64Url() {
  const domains = ['https://leetcode.com/', 'https://www.example.com/', 'https://challenge.domain.com/'];
  const paths = ['problem/', 'challenge/', 'quiz/', 'exercise/'];
  const ids = ['12345', '67890', 'abcdef', 'xyz123'];
  
  const url = domains[Math.floor(Math.random() * domains.length)] + 
              paths[Math.floor(Math.random() * paths.length)] +
              ids[Math.floor(Math.random() * ids.length)];
              
  return Buffer.from(url).toString('base64');
}

// 生成随机时间
function getRandomTime() {
  const year = 2023 + Math.floor(Math.random() * 3);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const second = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 生成随机解决方案
function getRandomSolutions() {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3个解决方案
  const solutions = [];
  
  const titles = ['使用Puppeteer绕过检测', '静态分析方法', 'Hook方法绕过', '逆向工程思路', 'AST分析方案'];
  const urls = ['https://github.com/user/repo', 'https://gist.github.com/user/id', 'https://medium.com/@user/article'];
  const sources = ['GitHub', 'StackOverflow', 'Medium', 'YouTube', 'Personal Blog'];
  const authors = ['John Doe', 'Jane Smith', 'Alex Chen', null, 'Web Security Expert'];
  
  for (let i = 0; i < count; i++) {
    solutions.push({
      title: titles[Math.floor(Math.random() * titles.length)],
      url: urls[Math.floor(Math.random() * urls.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      author: authors[Math.floor(Math.random() * authors.length)]
    });
  }
  
  return solutions;
}

// 生成单个挑战YAML内容
function generateChallenge(index) {
  const id = `mock-challenge-${index}`;
  const tags = getRandomTags();
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const name = `Mock挑战题目 #${index}`;
  const difficultyLevel = Math.floor(Math.random() * 5) + 1;
  const description = `这是一个示例挑战题目的描述，难度为${difficultyLevel}星级。`;
  const base64Url = getRandomBase64Url();
  const isExpired = Math.random() > 0.9; // 10%的概率为过期
  const solutions = getRandomSolutions();
  const createTime = getRandomTime();
  const updateTime = getRandomTime();

  return `# 挑战题目文件
version: 1

challenges:
  - id: ${id}
    tags:
${tags.map(tag => `      - ${tag}`).join('\n')}
    platform: ${platform}
    name: ${name}
    difficulty-level: ${difficultyLevel}
    description: ${description}
    base64-url: ${base64Url}
    is-expired: ${isExpired}
    solutions:
${solutions.map(solution => `      - title: ${solution.title}
        url: ${solution.url}
        source: ${solution.source}
        author: ${solution.author || ''}`).join('\n')}
    create-time: ${createTime}
    update-time: ${updateTime}
`;
}

// 生成并保存100个YAML文件
const outputDir = path.join(__dirname, 'mock_data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (let i = 1; i <= 100; i++) {
  const yamlContent = generateChallenge(i);
  const filePath = path.join(outputDir, `challenge_${i}.yml`);
  fs.writeFileSync(filePath, yamlContent);
  console.log(`生成文件: ${filePath}`);
}

console.log('生成完成: 已创建100个模拟YAML文件'); 