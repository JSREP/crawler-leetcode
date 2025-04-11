#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { faker } from '@faker-js/faker';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置参数
const TOTAL_CHALLENGES = 1000;
const OUTPUT_DIRECTORY = path.resolve(__dirname, '../../docs/challenges/mock_data');
const PLATFORMS = ['Web', 'Mobile', 'API', 'Desktop', 'IoT'];
const DIFFICULTY_RANGE = [1, 5]; // 1-5星难度
const TAGS_LIST = [
  'XSS', 'CSRF', 'SQL-Injection', 'Command-Injection', 'Path-Traversal',
  'Authentication', 'Authorization', 'Access-Control', 'Encryption', 'Hashing',
  'JWT', 'OAuth', 'Session-Management', 'CORS', 'CSP',
  'Rate-Limiting', 'Input-Validation', 'Output-Encoding', 'File-Upload', 'HTTP-Headers',
  'Business-Logic', 'API-Security', 'GraphQL', 'WebSockets', 'SSRF',
  'XXE', 'Deserialization', 'Browser-Extensions', 'Mobile-Security', 'Race-Condition'
];

// 确保输出目录存在
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`创建目录: ${directory}`);
  }
}

// 删除旧数据
function removeOldData(directory) {
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory);
    let count = 0;
    for (const file of files) {
      if (file.startsWith('challenge_') && file.endsWith('.yml')) {
        fs.unlinkSync(path.join(directory, file));
        count++;
      }
    }
    console.log(`已删除 ${count} 个旧文件`);
  }
}

// 生成随机挑战对象
function generateChallenge(id) {
  const difficulty = faker.number.int({ min: DIFFICULTY_RANGE[0], max: DIFFICULTY_RANGE[1] });
  const platform = faker.helpers.arrayElement(PLATFORMS);
  
  // 生成2-5个随机标签
  const tagsCount = faker.number.int({ min: 2, max: 5 });
  const tags = faker.helpers.arrayElements(TAGS_LIST, tagsCount);
  
  // 随机决定是否生成解决方案
  const hasSolutions = faker.datatype.boolean(0.7); // 70%的概率有解决方案
  const solutionsCount = hasSolutions ? faker.number.int({ min: 1, max: 3 }) : 0;
  
  const solutions = [];
  for (let i = 0; i < solutionsCount; i++) {
    solutions.push({
      title: faker.lorem.sentence(3, 6),
      url: faker.internet.url(),
      source: faker.helpers.arrayElement(['GitHub', 'Medium', 'StackOverflow', 'Blog', 'YouTube']),
      author: faker.datatype.boolean(0.9) ? faker.person.fullName() : '' // 10%的概率没有作者
    });
  }

  // 生成两个不同的时间，确保创建时间在更新时间之前
  const createTime = faker.date.past({ years: 2 });
  const updateTime = faker.date.between({ from: createTime, to: new Date() });

  // 生成idAlias，格式为 'mock-' + id
  const idAlias = `mock-challenge-${id}`;

  return {
    id: id, // 整数类型的id
    'id-alias': idAlias, // 添加id-alias字段
    tags,
    platform,
    name: `Mock挑战题目 #${id}`,
    'difficulty-level': difficulty,
    description: `这是一个示例挑战题目的描述，难度为${difficulty}星级。${faker.lorem.paragraph(2)}`,
    'base64-url': Buffer.from(`https://challenge.domain.com/quiz/${faker.string.alphanumeric(10)}`).toString('base64'),
    'is-expired': faker.datatype.boolean(0.1), // 10%的概率已过期
    solutions,
    'create-time': createTime.toISOString().replace('T', ' ').substring(0, 19),
    'update-time': updateTime.toISOString().replace('T', ' ').substring(0, 19)
  };
}

// 生成单个挑战文件
function generateChallengeFile(id) {
  const challenge = generateChallenge(id);
  const yamlContent = yaml.dump({
    version: 1,
    challenges: [challenge]
  });
  
  const fileName = `challenge_${id}.yml`;
  const filePath = path.join(OUTPUT_DIRECTORY, fileName);
  
  fs.writeFileSync(filePath, `# 挑战题目文件\n${yamlContent}`);
  return fileName;
}

// 主函数
function main() {
  ensureDirectoryExists(OUTPUT_DIRECTORY);
  removeOldData(OUTPUT_DIRECTORY);
  
  console.log(`开始生成 ${TOTAL_CHALLENGES} 个挑战文件...`);
  
  let generatedFiles = 0;
  for (let i = 1; i <= TOTAL_CHALLENGES; i++) {
    const fileName = generateChallengeFile(i);
    generatedFiles++;
    
    if (generatedFiles % 100 === 0 || generatedFiles === TOTAL_CHALLENGES) {
      console.log(`已生成 ${generatedFiles} / ${TOTAL_CHALLENGES} 个文件`);
    }
  }
  
  console.log('所有挑战文件生成完毕！');
}

main(); 