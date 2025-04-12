import { FormInstance } from 'antd';

export interface Solution {
  /**
   * 解决方案标题
   */
  title: string;

  /**
   * 解决方案链接
   */
  url: string;

  /**
   * 来源平台
   */
  source?: string;

  /**
   * 作者
   */
  author?: string;
}

export interface ChallengeFormData {
  id?: number | null;
  idAlias?: string;
  platform?: 'Web' | 'Android' | 'iOS';
  name?: string;
  nameEn?: string;
  difficultyLevel?: number;
  description?: string;
  descriptionEn?: string;
  // 兼容markdown编辑器
  descriptionMarkdown?: string;
  descriptionMarkdownEn?: string;
  // 目标网站URL的base64编码
  base64Url?: string;
  // 链接是否失效标志
  isExpired?: boolean;
  example?: string;
  tags?: string[];
  solutions?: {
    title: string;
    url: string;
    source?: string;
    author?: string;
  }[];
  // 测试用例
  testCases?: string[];
  // YAML注释
  comments?: string[];
  // 原始YAML文本（用于保留注释）
  rawYaml?: string;
}

export interface ChallengeData {
  id: number | null;
  'id-alias'?: string;
  tags: string[];
  platform: 'Web' | 'Android' | 'iOS';
  name: string;
  name_en?: string;
  'difficulty-level': number;
  'description-markdown': string;
  'description-markdown_en'?: string;
  'base64-url': string;
  'is-expired': boolean;
  solutions: {
    title: string;
    url: string;
    source?: string;
    author?: string;
  }[];
  'create-time': string;
  'update-time': string;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface SectionProps {
  form: FormInstance;
  onChange?: (values: any) => void;
} 