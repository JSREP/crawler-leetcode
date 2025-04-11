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
const mockMarkdownDir = path.join(__dirname, '../docs/challenges/contents');

if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir, { recursive: true });
}

if (!fs.existsSync(mockMarkdownDir)) {
  fs.mkdirSync(mockMarkdownDir, { recursive: true });
}

// 可能的标签列表
const possibleTags = [
  '安全', '漏洞', 'Web安全', '网络安全', '身份认证', '授权', '注入', 'XSS', 'CSRF', 
  'SQL注入', '命令注入', '代码审计', '信息泄露', '密码学', '加密算法', '哈希碰撞', 
  '内存安全', '缓冲区溢出', '权限提升', '远程执行', '拒绝服务', '中间人攻击',
  '固件安全', '物联网安全', '区块链安全', '移动应用安全', 'API安全', '容器安全'
];

// 可能的平台
const possiblePlatforms = [
  'CTF', 'HackTheBox', 'TryHackMe', 'VulnHub', 'RootMe', 'LeetCode', 
  'HackerOne', 'BugCrowd', 'Pentesterlab', 'OWASP', '实验室', '原创'
];

// 代码漏洞类型
const vulnerabilityTypes = [
  { name: 'XSS漏洞', desc: '直接将用户输入插入到DOM中' },
  { name: 'SQL注入', desc: '未使用参数化查询' },
  { name: 'CSRF攻击', desc: '缺少跨站请求伪造防护' },
  { name: '命令注入', desc: '直接使用用户输入执行命令' },
  { name: '路径遍历', desc: '未对文件路径进行验证' },
  { name: '不安全的反序列化', desc: '未检查反序列化的数据' },
  { name: '权限控制不当', desc: '未正确验证用户权限' },
  { name: '敏感信息泄露', desc: '在源代码或响应中暴露敏感信息' },
  { name: '不安全的密码存储', desc: '使用弱哈希算法或明文存储密码' },
  { name: '缺乏输入验证', desc: '没有检查和过滤用户输入' }
];

// 代码示例模板
const codeTemplates = [
  {
    language: 'javascript',
    template: `function processUserInput(input) {
  // PLACEHOLDER1
  document.getElementById('output').innerHTML = input;
  
  // PLACEHOLDER2
  let query = "SELECT * FROM users WHERE username = '" + input + "'";
  
  return executeQuery(query);
}`
  },
  {
    language: 'python',
    template: `def process_data(user_input):
    # PLACEHOLDER1
    results = []
    
    # PLACEHOLDER2
    cmd = f"grep {user_input} /var/log/app.log"
    
    # PLACEHOLDER3
    return os.system(cmd)`
  },
  {
    language: 'java',
    template: `public void processRequest(HttpServletRequest request, HttpServletResponse response) {
    // PLACEHOLDER1
    String filename = request.getParameter("filename");
    
    // PLACEHOLDER2
    File file = new File("/user/data/" + filename);
    
    // PLACEHOLDER3
    try (FileInputStream fis = new FileInputStream(file)) {
        // 处理文件内容
    } catch (Exception e) {
        e.printStackTrace();
    }
}`
  },
  {
    language: 'php',
    template: `<?php
// PLACEHOLDER1
$id = $_GET['id'];

// PLACEHOLDER2
$query = "SELECT * FROM users WHERE id = " . $id;

// PLACEHOLDER3
$result = mysqli_query($conn, $query);
?>`
  },
  {
    language: 'csharp',
    template: `public ActionResult UserProfile(string username)
{
    // PLACEHOLDER1
    var query = $"SELECT * FROM Users WHERE Username = '{username}'";
    
    // PLACEHOLDER2
    using (var connection = new SqlConnection(ConnectionString))
    {
        // PLACEHOLDER3
        var user = connection.QuerySingleOrDefault(query);
        return View(user);
    }
}`
  }
];

// 一个基本的Base64编码的1x1像素透明PNG图片，用作示例图片
const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 生成随机的代码段落，带有漏洞
function generateVulnerableCode() {
  const codeTemplate = faker.helpers.arrayElement(codeTemplates);
  let code = codeTemplate.template;
  
  // 随机选择2-3个漏洞类型
  const vulnCount = faker.number.int({ min: 2, max: 3 });
  const selectedVulns = faker.helpers.arrayElements(vulnerabilityTypes, vulnCount);
  
  // 替换占位符
  for (let i = 1; i <= 3; i++) {
    const placeholder = `PLACEHOLDER${i}`;
    if (code.includes(placeholder)) {
      // 有50%的概率添加注释说明漏洞
      if (i <= selectedVulns.length && faker.datatype.boolean()) {
        const vuln = selectedVulns[i-1];
        code = code.replace(placeholder, `// 存在${vuln.name}: ${vuln.desc}`);
      } else {
        code = code.replace(placeholder, '');
      }
    }
  }
  
  return {
    language: codeTemplate.language,
    code
  };
}

// 生成随机的Markdown内容
function generateRandomMarkdown(id) {
  const sections = [];
  
  // 添加标题
  sections.push(`# 挑战 ${id}: ${faker.hacker.phrase()}`);
  sections.push('');
  
  // 添加描述
  sections.push(`## 描述`);
  sections.push('');
  sections.push(faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })));
  sections.push('');
  
  // 随机决定是否添加图片引用
  if (Math.random() > 0.5) {
    sections.push('## 安全漏洞分布');
    sections.push('');
    sections.push('以下是该应用中发现的安全漏洞分布情况:');
    sections.push('');
    sections.push('![漏洞分布图](./images/vulnerability_chart.png)');
    sections.push('');
  }
  
  // 添加任务目标
  sections.push('## 任务');
  sections.push('');
  const taskCount = faker.number.int({ min: 1, max: 5 });
  for (let i = 1; i <= taskCount; i++) {
    sections.push(`${i}. ${faker.hacker.phrase()}`);
  }
  sections.push('');
  
  // 随机添加代码示例
  if (Math.random() > 0.3) {
    sections.push('## 示例代码');
    sections.push('');
    const codeLanguages = ['javascript', 'python', 'php', 'java', 'c', 'sql'];
    const language = faker.helpers.arrayElement(codeLanguages);
    
    let code = '';
    switch (language) {
      case 'javascript':
        code = `
function validateUser(username, password) {
  // 警告: 不安全的验证方式
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return db.execute(query);
}`;
        break;
      case 'python':
        code = `
def execute_command(user_input):
    # 危险: 直接执行用户输入
    import os
    os.system(user_input)`;
        break;
      case 'php':
        code = `
<?php
// 不安全的文件包含
$page = $_GET['page'];
include($page);
?>`;
        break;
      default:
        code = `// 存在安全漏洞的示例代码
public class Vulnerability {
    public static void main(String[] args) {
        String input = args[0];
        System.out.println("Processing: " + input);
        // 未经验证的输入直接使用
    }
}`;
    }
    
    sections.push(`\`\`\`${language}`);
    sections.push(code);
    sections.push('```');
    sections.push('');
  }
  
  // 随机添加提示
  if (Math.random() > 0.4) {
    sections.push('## 提示');
    sections.push('');
    sections.push('> ' + faker.hacker.phrase());
    sections.push('');
    
    if (Math.random() > 0.5) {
      sections.push('> 思考如何使用以下技术进行防御:');
      sections.push('> - 输入验证');
      sections.push('> - 参数化查询');
      sections.push('> - 最小权限原则');
      sections.push('');
    }
  }
  
  // 添加注意事项
  if (Math.random() > 0.6) {
    sections.push('## 注意事项');
    sections.push('');
    sections.push('- ' + faker.lorem.sentence());
    sections.push('- 该挑战需要先具备基本的网络安全知识');
    sections.push('- 请在合法环境中进行测试，不要对未授权系统执行攻击');
    sections.push('');
    
    // 随机添加代码截图引用
    if (Math.random() > 0.5) {
      sections.push('参考以下代码结构:');
      sections.push('');
      sections.push('![代码示例](./images/code_example.png)');
      sections.push('');
    }
  }
  
  return sections.join('\n');
}

// 为特定的挑战创建样例图片
function createSampleImages(id) {
  const imagesDir = path.join(mockMarkdownDir, `challenge_${id}`, 'images');
  
  // 确保图片目录存在
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // 生成漏洞分布图表
  const vulnChartPath = path.join(imagesDir, 'vulnerability_chart.png');
  fs.writeFileSync(vulnChartPath, Buffer.from(imageBase64.split(',')[1], 'base64'));
  
  // 随机决定是否创建额外的截图
  if (Math.random() > 0.5) {
    const screenshotPath = path.join(imagesDir, 'code_example.png');
    fs.writeFileSync(screenshotPath, Buffer.from(imageBase64.split(',')[1], 'base64'));
  }
  
  return imagesDir;
}

// 生成YAML文件
function generateYamlFile(id) {
  const challenge = generateRandomChallenge(id);
  const yamlFilePath = path.join(mockDataDir, `challenge_${id}.yml`);
  
  // 随机决定是使用内嵌markdown还是外部markdown文件
  const useMarkdownPath = Math.random() > 0.3; // 70%的概率使用外部markdown
  
  let markdownContent = null;
  let markdownPath = null;
  
  if (useMarkdownPath) {
    markdownContent = generateRandomMarkdown(id);
    markdownPath = `challenges/markdown/challenge_${id}/description.md`;
    
    // 创建markdown文件
    const fullMarkdownDir = path.join(mockMarkdownDir, `challenge_${id}`);
    if (!fs.existsSync(fullMarkdownDir)) {
      fs.mkdirSync(fullMarkdownDir, { recursive: true });
    }
    
    const fullMarkdownPath = path.join(fullMarkdownDir, 'description.md');
    fs.writeFileSync(fullMarkdownPath, markdownContent);
    
    // 创建示例图片
    createSampleImages(id);
    
    // 设置markdown路径
    challenge['description-markdown-path'] = markdownPath;
  } else {
    // 直接使用内嵌markdown
    challenge['description-markdown'] = generateRandomMarkdown(id);
  }
  
  // 将挑战对象转换为YAML
  const yamlContent = yaml.dump(challenge);
  fs.writeFileSync(yamlFilePath, yamlContent);
  
  return { path: yamlFilePath, challenge };
}

// 生成指定数量的挑战数据
function generateMockData(count = 30) {
  console.log(`开始生成${count}个挑战数据...`);
  
  const challenges = [];
  
  for (let i = 1; i <= count; i++) {
    console.log(`生成挑战 ${i}/${count}`);
    const result = generateYamlFile(i);
    challenges.push(result.challenge);
  }
  
  console.log(`成功生成${count}个挑战数据！`);
  return challenges;
}

// 主函数
function main() {
  console.log('开始生成模拟数据...');
  
  // 默认生成30个挑战
  const challengeCount = 30;
  const challenges = generateMockData(challengeCount);
  
  console.log(`成功生成${challengeCount}个挑战！`);
  console.log(`YAML文件已保存到: ${mockDataDir}`);
  console.log(`Markdown文件已保存到: ${mockMarkdownDir}`);
}

// 执行主函数
main(); 