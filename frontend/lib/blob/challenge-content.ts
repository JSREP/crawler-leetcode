/**
 * 挑战内容Blob存储管理
 * 将挑战的Markdown内容存储到Vercel Blob Store
 */

import { put, del, head } from '@vercel/blob';
import { Challenge } from '@/types/challenge';

export interface ChallengeContent {
  description: string;
  description_en?: string;
  solution?: string;
  solution_en?: string;
  hints?: string[];
  hints_en?: string[];
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  resources?: Array<{
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'tool' | 'other';
  }>;
}

/**
 * 上传挑战内容到Blob Store
 */
export async function uploadChallengeContent(
  challengeAlias: string,
  content: ChallengeContent
): Promise<string> {
  try {
    const fileName = `challenges/${challengeAlias}/content.md`;
    
    // 将内容转换为Markdown格式
    const markdownContent = convertToMarkdown(content);
    
    const blob = await put(fileName, markdownContent, {
      access: 'public',
      contentType: 'text/markdown',
    });
    
    return blob.url;
  } catch (error) {
    console.error('Error uploading challenge content:', error);
    throw new Error('Failed to upload challenge content');
  }
}

/**
 * 从Blob Store获取挑战内容
 */
export async function getChallengeContent(
  challengeAlias: string
): Promise<ChallengeContent | null> {
  try {
    const fileName = `challenges/${challengeAlias}/content.md`;
    
    // 检查文件是否存在
    try {
      await head(fileName);
    } catch (error) {
      return null; // 文件不存在
    }
    
    // 获取文件内容 - 使用Vercel Blob的公共URL
    const blobUrl = `https://${process.env.VERCEL_URL || 'localhost'}/_vercel/blob/${fileName}`;
    const response = await fetch(blobUrl);
    if (!response.ok) {
      return null;
    }
    
    const markdownContent = await response.text();
    return parseMarkdownContent(markdownContent);
  } catch (error) {
    console.error('Error getting challenge content:', error);
    return null;
  }
}

/**
 * 删除挑战内容
 */
export async function deleteChallengeContent(challengeAlias: string): Promise<void> {
  try {
    const fileName = `challenges/${challengeAlias}/content.md`;
    await del(fileName);
  } catch (error) {
    console.error('Error deleting challenge content:', error);
    throw new Error('Failed to delete challenge content');
  }
}

/**
 * 将内容对象转换为Markdown格式
 */
function convertToMarkdown(content: ChallengeContent): string {
  let markdown = '';
  
  // 描述
  if (content.description) {
    markdown += `# 挑战描述\n\n${content.description}\n\n`;
  }
  
  if (content.description_en) {
    markdown += `# Challenge Description (English)\n\n${content.description_en}\n\n`;
  }
  
  // 示例
  if (content.examples && content.examples.length > 0) {
    markdown += `## 示例\n\n`;
    content.examples.forEach((example, index) => {
      markdown += `### 示例 ${index + 1}\n\n`;
      markdown += `**输入:**\n\`\`\`\n${example.input}\n\`\`\`\n\n`;
      markdown += `**输出:**\n\`\`\`\n${example.output}\n\`\`\`\n\n`;
      if (example.explanation) {
        markdown += `**说明:** ${example.explanation}\n\n`;
      }
    });
  }
  
  // 提示
  if (content.hints && content.hints.length > 0) {
    markdown += `## 提示\n\n`;
    content.hints.forEach((hint, index) => {
      markdown += `${index + 1}. ${hint}\n`;
    });
    markdown += '\n';
  }
  
  if (content.hints_en && content.hints_en.length > 0) {
    markdown += `## Hints (English)\n\n`;
    content.hints_en.forEach((hint, index) => {
      markdown += `${index + 1}. ${hint}\n`;
    });
    markdown += '\n';
  }
  
  // 解决方案
  if (content.solution) {
    markdown += `## 解决方案\n\n${content.solution}\n\n`;
  }
  
  if (content.solution_en) {
    markdown += `## Solution (English)\n\n${content.solution_en}\n\n`;
  }
  
  // 资源链接
  if (content.resources && content.resources.length > 0) {
    markdown += `## 相关资源\n\n`;
    content.resources.forEach(resource => {
      markdown += `- [${resource.title}](${resource.url}) (${resource.type})\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
}

/**
 * 解析Markdown内容为内容对象
 */
function parseMarkdownContent(markdown: string): ChallengeContent {
  const content: ChallengeContent = {
    description: '',
    examples: [],
    hints: [],
    hints_en: [],
    resources: [],
  };
  
  const lines = markdown.split('\n');
  let currentSection = '';
  let currentContent = '';
  
  for (const line of lines) {
    if (line.startsWith('# 挑战描述')) {
      currentSection = 'description';
      currentContent = '';
    } else if (line.startsWith('# Challenge Description (English)')) {
      currentSection = 'description_en';
      currentContent = '';
    } else if (line.startsWith('## 解决方案')) {
      currentSection = 'solution';
      currentContent = '';
    } else if (line.startsWith('## Solution (English)')) {
      currentSection = 'solution_en';
      currentContent = '';
    } else if (line.startsWith('## 提示')) {
      currentSection = 'hints';
      currentContent = '';
    } else if (line.startsWith('## Hints (English)')) {
      currentSection = 'hints_en';
      currentContent = '';
    } else if (line.startsWith('## 相关资源')) {
      currentSection = 'resources';
      currentContent = '';
    } else {
      if (currentSection && line.trim()) {
        currentContent += line + '\n';
      }
      
      // 处理不同类型的内容
      if (currentSection === 'description' && line.trim() && !line.startsWith('#')) {
        content.description += line + '\n';
      } else if (currentSection === 'description_en' && line.trim() && !line.startsWith('#')) {
        content.description_en = (content.description_en || '') + line + '\n';
      } else if (currentSection === 'solution' && line.trim() && !line.startsWith('#')) {
        content.solution = (content.solution || '') + line + '\n';
      } else if (currentSection === 'solution_en' && line.trim() && !line.startsWith('#')) {
        content.solution_en = (content.solution_en || '') + line + '\n';
      }
    }
  }
  
  // 清理内容
  content.description = content.description.trim();
  if (content.description_en) content.description_en = content.description_en.trim();
  if (content.solution) content.solution = content.solution.trim();
  if (content.solution_en) content.solution_en = content.solution_en.trim();
  
  return content;
}

/**
 * 迁移现有挑战内容到Blob Store
 */
export async function migrateChallengeToBlob(challenge: Challenge): Promise<string> {
  const content: ChallengeContent = {
    description: challenge.description_markdown || challenge.description || '',
    description_en: challenge.description_markdown_en || challenge.descriptionEN || '',
  };
  
  return await uploadChallengeContent(challenge.id_alias, content);
}
