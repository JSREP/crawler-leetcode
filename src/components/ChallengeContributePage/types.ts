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
  id: number | null;
  idAlias: string;
  platform: 'Web' | 'Android' | 'iOS';
  name: string;
  nameEn: string;
  difficultyLevel: number;
  descriptionMarkdown: string;
  descriptionMarkdownEn: string;
  base64Url: string;
  isExpired: boolean;
  tags: string[];
  solutions: Solution[];
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