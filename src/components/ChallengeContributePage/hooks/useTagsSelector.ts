import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FormInstance, message } from 'antd';
import { useEventListener, dispatchFormValueUpdated, TAGS_UPDATED } from './useEventListener';

// 最近使用的标签本地存储键
const RECENT_TAGS_KEY = 'recent_used_tags';

// 标签分类定义
const TAG_CATEGORIES: Record<string, string[]> = {
  '前端基础': ['HTML', 'CSS', 'JavaScript', 'DOM', 'BOM', 'Web API'],
  '前端框架': ['React', 'Vue', 'Angular', 'Svelte', 'Solid'],
  '前端工具': ['Webpack', 'Vite', 'Rollup', 'ESLint', 'Babel', 'TypeScript'],
  '后端开发': ['Node.js', 'Express', 'Koa', 'Nest.js', 'MongoDB', 'SQL'],
  '移动端': ['Android', 'iOS', 'Flutter', 'React Native', 'Responsive'],
  '性能优化': ['Performance', 'Lazy Loading', 'Code Splitting', 'Caching'],
  '安全': ['Security', 'CORS', 'XSS', 'CSRF', 'Authentication'],
  '网络': ['HTTP', 'WebSocket', 'REST', 'GraphQL', 'API'],
  '用户体验': ['Animation', 'Transition', 'UI/UX', 'Accessibility'],
  '其他': ['Testing', 'DevOps', 'Git', 'Docker', 'CI/CD']
};

// 保存最近使用的标签
const saveRecentTags = (tag: string) => {
  try {
    // 获取已保存的最近标签
    const savedTags = localStorage.getItem(RECENT_TAGS_KEY);
    let recentTags: string[] = savedTags ? JSON.parse(savedTags) : [];
    
    // 如果标签已存在，先移除它
    recentTags = recentTags.filter(t => t !== tag);
    
    // 在数组开头添加新标签
    recentTags.unshift(tag);
    
    // 仅保留最近10个标签
    recentTags = recentTags.slice(0, 10);
    
    // 保存到本地存储
    localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(recentTags));
    
    return recentTags;
  } catch (error) {
    console.error('保存最近标签失败:', error);
    return [];
  }
};

// 获取最近使用的标签
const getRecentTags = (): string[] => {
  try {
    const savedTags = localStorage.getItem(RECENT_TAGS_KEY);
    return savedTags ? JSON.parse(savedTags) : [];
  } catch (error) {
    console.error('获取最近标签失败:', error);
    return [];
  }
};

// 将标签按分类归类
const categorizeTags = (tags: string[]): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  
  // 初始化分类
  Object.keys(TAG_CATEGORIES).forEach(category => {
    result[category] = [];
  });
  
  // 分类标签
  tags.forEach(tag => {
    let categorized = false;
    
    // 检查标签属于哪个分类
    for (const [category, keywords] of Object.entries(TAG_CATEGORIES)) {
      for (const keyword of keywords) {
        if (tag.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(tag.toLowerCase())) {
          result[category].push(tag);
          categorized = true;
          break;
        }
      }
      if (categorized) break;
    }
    
    // 如果未分类，添加到"其他"
    if (!categorized) {
      result['其他'].push(tag);
    }
  });
  
  // 移除空分类
  Object.keys(result).forEach(category => {
    if (result[category].length === 0) {
      delete result[category];
    }
  });
  
  return result;
};

interface UseTagsSelectorProps {
  form: FormInstance;
  existingTags?: string[];
  onChange?: (value: string[]) => void;
}

interface UseTagsSelectorReturn {
  tags: string[];
  newTag: string;
  tagOptions: { value: string }[];
  isInputFocused: boolean;
  recentlyUsedTags: string[];
  categorizedTags: Record<string, string[]>;
  handleAddTag: () => void;
  handleRemoveTag: (removedTag: string, e?: React.MouseEvent<HTMLElement>) => void;
  handleTagInputChange: (value: string) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  handleTagSelect: (value: string) => void;
  handleTagInputKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * 标签选择器逻辑 Hook
 */
export const useTagsSelector = ({ 
  form, 
  existingTags = [], 
  onChange 
}: UseTagsSelectorProps): UseTagsSelectorReturn => {
  const [newTag, setNewTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string }[]>([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [recentlyUsedTags, setRecentlyUsedTags] = useState<string[]>(getRecentTags());
  
  // 缓存已有标签的分类
  const categorizedTags = useMemo(() => 
    categorizeTags(existingTags), [existingTags]);
  
  // 记录是否已初始化
  const isInitialized = useRef(false);

  // 包装onChange为稳定的引用，避免引发无限循环
  const stableOnChange = useCallback((updatedTags: string[]) => {
    if (onChange) {
      onChange(updatedTags);
    }
  }, [onChange]);

  // 更新标签并触发表单更新
  const updateTagsAndForm = useCallback((updatedTags: string[]) => {
    setTags(updatedTags);
    
    // 更新表单字段
    form.setFieldsValue({ tags: updatedTags });
    
    // 主动触发表单的onValuesChange回调
    form.validateFields(['tags']).catch(() => {
      // 忽略验证错误
    }).then(() => {
      // 手动触发表单值变更事件，确保localStorage保存
      dispatchFormValueUpdated();
      
      // 如果有传入onChange回调，也调用它
      stableOnChange(updatedTags);
    });
  }, [form, stableOnChange]);

  // 初始化时从表单获取已有标签
  useEffect(() => {
    if (!isInitialized.current) {
      const formTags = form.getFieldValue('tags');
      if (formTags && Array.isArray(formTags) && formTags.length > 0) {
        setTags(formTags);
      }
      isInitialized.current = true;
    }
  }, [form]);

  // 监听全局tags-updated事件，用于YAML导入时更新标签
  useEventListener<{ tags: string[] }>(
    TAGS_UPDATED,
    (event) => {
      if (event.detail && event.detail.tags && Array.isArray(event.detail.tags)) {
        setTags(event.detail.tags);
        // 同步更新表单字段
        form.setFieldsValue({ tags: event.detail.tags });
      }
    },
    [form]
  );

  /**
   * 计算最常用的标签
   * 根据标签在已有挑战中出现的频率，返回前100个最常用的标签
   */
  const getTopTags = useMemo(() => {
    // 如果existingTags为空，返回空数组
    if (!existingTags || existingTags.length === 0) {
      return [];
    }

    // 统计每个标签出现的频率
    const tagFrequency: Record<string, number> = {};
    existingTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    // 按频率排序并返回前100个
    return Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1]) // 按频率降序排序
      .slice(0, 100) // 取前100个
      .map(([tag]) => ({ value: tag })); // 转换为AutoComplete需要的格式
  }, [existingTags]);

  // 存储getTopTags的结果，避免重复计算
  const topTagsOptions = useMemo(() => getTopTags, [getTopTags]);

  // 当用户输入标签或输入框获得焦点时，更新自动完成选项
  useEffect(() => {
    if (newTag) {
      // 如果有输入内容，根据输入过滤标签
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(newTag.toLowerCase()));
      
      // 只在需要更新时才调用setTagOptions
      if (filtered.length > 0 || tagOptions.length > 0) {
        setTagOptions(filtered.map(tag => ({ value: tag })));
      }
    } else if (isInputFocused) {
      // 如果输入框获得焦点但没有输入内容，显示最常用的标签
      setTagOptions(topTagsOptions);
    }
  }, [newTag, existingTags, isInputFocused, topTagsOptions]);

  const handleAddTag = () => {
    // 标签去除首尾空格
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) {
      message.warning('标签不能为空');
      return;
    }
    
    // 检查是否已存在（不区分大小写）
    const tagExists = tags.some(tag => 
      tag.toLowerCase() === trimmedTag.toLowerCase()
    );
    
    if (tagExists) {
      message.warning(`标签"${trimmedTag}"已存在`);
      return;
    }
    
    if (tags.length >= 100) {
      message.warning('最多只能添加100个标签');
      return;
    }
    
    const updatedTags = [...tags, trimmedTag];
    setNewTag('');
    
    // 添加到最近使用的标签
    setRecentlyUsedTags(saveRecentTags(trimmedTag));
    
    // 更新标签和表单
    updateTagsAndForm(updatedTags);
  };

  const handleRemoveTag = (removedTag: string, e?: React.MouseEvent<HTMLElement>) => {
    // 防止事件冒泡
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 使用标签值而不是索引进行过滤，确保精确匹配
    const updatedTags = tags.filter(tag => tag !== removedTag);
    
    // 更新标签和表单
    updateTagsAndForm(updatedTags);
  };

  const handleTagInputChange = (value: string) => {
    setNewTag(value);
  };

  // 输入框获得焦点时的处理函数
  const handleInputFocus = () => {
    // 设置输入框焦点状态为true
    setIsInputFocused(true);
    // 显示最常用的标签，不需要等用户输入
    setTagOptions(topTagsOptions);
  };

  // 输入框失去焦点时的处理函数
  const handleInputBlur = () => {
    // 设置输入框焦点状态为false
    setIsInputFocused(false);
    // 延迟一段时间再清空选项，以便用户有时间点击选项
    setTimeout(() => {
      setTagOptions([]);
    }, 200);
  };

  const handleTagSelect = (value: string) => {
    // 标签去除首尾空格
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return;
    }
    
    // 检查是否已存在（不区分大小写）
    const tagExists = tags.some(tag => 
      tag.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (tagExists) {
      message.warning(`标签"${trimmedValue}"已存在`);
      return;
    }
    
    const updatedTags = [...tags, trimmedValue];
    setNewTag('');
    
    // 添加到最近使用的标签
    setRecentlyUsedTags(saveRecentTags(trimmedValue));
    
    // 更新标签和表单
    updateTagsAndForm(updatedTags);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return {
    tags,
    newTag,
    tagOptions,
    isInputFocused,
    recentlyUsedTags,
    categorizedTags,
    handleAddTag,
    handleRemoveTag,
    handleTagInputChange,
    handleInputFocus,
    handleInputBlur,
    handleTagSelect,
    handleTagInputKeyPress
  };
}; 