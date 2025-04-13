import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FormInstance, message } from 'antd';
import { useEventListener, dispatchFormValueUpdated, TAGS_UPDATED } from './useEventListener';
import { TagFrequency } from './useAllTags';

// 最近使用的标签本地存储键
const RECENT_TAGS_KEY = 'recent_used_tags';

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

// 始终按频率排序的会话存储键
const SESSION_SORTING_KEY = 'tags_frequency_sorting';

// 重置标签选择器的聚焦状态，用于测试
const resetFocusState = () => {
  try {
    localStorage.removeItem('tags_selector_has_been_focused');
    // 设置会话存储，表示要按频率排序
    sessionStorage.setItem(SESSION_SORTING_KEY, 'true');
    console.log('已重置标签选择器状态，将按频率排序');
  } catch (error) {
    console.error('重置聚焦状态失败:', error);
  }
};

// 添加到全局窗口对象，以便在控制台调用
(window as any).resetTagsSelectorFocus = resetFocusState;

// 按标签出现频率统计和排序
const getTagsByFrequency = (tags: string[]): Array<{ tag: string, count: number }> => {
  // 统计每个标签出现的频率
  const tagCounts: Record<string, number> = {};
  
  tags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  // 转换为数组并按频率降序排序
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

interface UseTagsSelectorProps {
  form: FormInstance;
  existingTags?: string[];
  tagsFrequency?: TagFrequency[];
  onChange?: (value: string[]) => void;
}

interface UseTagsSelectorReturn {
  tags: string[];
  newTag: string;
  tagOptions: { value: string }[];
  isInputFocused: boolean;
  recentlyUsedTags: string[];
  categorizedTags: Record<string, string[]>; // 保留接口兼容
  handleAddTag: () => void;
  handleRemoveTag: (removedTag: string, e?: React.MouseEvent<HTMLElement>) => void;
  handleTagInputChange: (value: string) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  handleTagSelect: (value: string) => void;
  handleTagInputKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

// 在组件加载时自动重置焦点状态
// 这样确保每次页面加载都按频率排序
if (typeof window !== 'undefined') {
  // 设置会话存储，表示要按频率排序
  sessionStorage.setItem(SESSION_SORTING_KEY, 'true');
}

/**
 * 标签选择器逻辑 Hook
 */
export const useTagsSelector = ({ 
  form, 
  existingTags = [], 
  tagsFrequency = [],
  onChange 
}: UseTagsSelectorProps): UseTagsSelectorReturn => {
  const [newTag, setNewTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string }[]>([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [recentlyUsedTags, setRecentlyUsedTags] = useState<string[]>(getRecentTags());
  
  // 总是使用频率排序标志
  const [alwaysUseSortByFrequency, setAlwaysUseSortByFrequency] = useState<boolean>(
    sessionStorage.getItem(SESSION_SORTING_KEY) === 'true'
  );
  
  // 已聚焦标志，但现在我们不再使用它来决定排序方式
  const [hasBeenFocused, setHasBeenFocused] = useState<boolean>(false);
  
  // 为了保持接口兼容，提供一个空的分类对象
  const categorizedTags = useMemo(() => ({}), []);
  
  // 记录是否已初始化
  const isInitialized = useRef(false);

  // 调试用 - 打印传入的标签频率数据
  useEffect(() => {
    if (tagsFrequency.length > 0) {
      console.log('传入的标签频率数据:', tagsFrequency.slice(0, 10));
    }
  }, [tagsFrequency]);

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
   * 获取排序后的标签列表
   */
  const getSortedTags = useCallback(() => {
    // 如果existingTags为空，返回空数组
    if (!existingTags || existingTags.length === 0) {
      return [];
    }

    console.log('是否总是按频率排序:', alwaysUseSortByFrequency);

    // 总是按频率排序或第一次聚焦时按频率排序
    if (alwaysUseSortByFrequency) {
      // 如果有传入标签频率数据，直接使用
      if (tagsFrequency && tagsFrequency.length > 0) {
        console.log('使用标签频率排序:', tagsFrequency.slice(0, 5).map(t => `${t.tag}(${t.count})`));
        const result = tagsFrequency.map(({ tag }) => ({ value: tag }));
        return result;
      } else {
        // 没有频率数据，按字母顺序排序
        console.log('没有频率数据，使用字母排序');
        return [...existingTags]
          .sort((a, b) => a.localeCompare(b))
          .map(tag => ({ value: tag }));
      }
    } else {
      // 按字母顺序排序
      console.log('已聚焦过且非强制频率排序模式，使用字母排序');
      return [...existingTags]
        .sort((a, b) => a.localeCompare(b))
        .map(tag => ({ value: tag }));
    }
  }, [existingTags, alwaysUseSortByFrequency, tagsFrequency]);

  // 存储排序后的标签，避免重复计算
  const sortedTagsOptions = useMemo(() => {
    const result = getSortedTags();
    // 打印排序后的前几个标签，方便调试
    if (result.length > 0) {
      console.log('排序后的标签列表（前5个）:', result.slice(0, 5).map(t => t.value));
    }
    return result;
  }, [getSortedTags]);

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
      // 如果输入框获得焦点但没有输入内容，显示所有标签
      console.log('设置标签选项:', sortedTagsOptions.length);
      setTagOptions(sortedTagsOptions);
    }
  }, [newTag, existingTags, isInputFocused, sortedTagsOptions, tagOptions.length]);

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
    
    // 记录已经获得过焦点，但我们不再使用它来决定排序方式
    if (!hasBeenFocused) {
      console.log('第一次聚焦标记');
      setHasBeenFocused(true);
    }
    
    // 显示所有标签，不需要等用户输入
    console.log('聚焦时设置标签选项:', sortedTagsOptions.length);
    setTagOptions(sortedTagsOptions);
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