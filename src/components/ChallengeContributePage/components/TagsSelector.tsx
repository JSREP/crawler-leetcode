import * as React from 'react';
import { useMemo, memo } from 'react';
import { Form, Tag, AutoComplete, Button, Space, Divider, Empty } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { SectionProps } from '../types';
import { useTagsSelector } from '../hooks';
import { tagsValidators } from '../utils/validators';

// AutoComplete的选项类型
type OptionType = {
  value: string;
  label: string | React.ReactNode;
} | {
  label: React.ReactNode;
  options: Array<{
    value: string;
    label: string | React.ReactNode;
  }>;
};

// 定义颜色映射
const tagColorMap: Record<string, string> = {
  'JavaScript': 'gold',
  'HTML': 'orange',
  'CSS': 'blue', 
  'React': 'cyan',
  'Vue': 'green',
  'Node.js': 'lime',
  'TypeScript': 'geekblue',
  'HTTP': 'red',
  'Web API': 'purple',
  'Android': 'green',
  'iOS': 'magenta',
  'Mobile': 'volcano',
  'Animation': 'pink',
  'Performance': 'orange',
  'Security': 'red',
  'Accessibility': 'purple',
};

// 获取标签颜色
const getTagColor = (tag: string): string => {
  // 直接匹配
  if (tagColorMap[tag]) {
    return tagColorMap[tag];
  }
  
  // 部分匹配
  for (const [key, color] of Object.entries(tagColorMap)) {
    if (tag.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  // 默认颜色
  const hashCode = tag.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0);
  const colors = ['blue', 'green', 'cyan', 'geekblue', 'purple', 'magenta', 'gold', 'lime'];
  return colors[hashCode % colors.length];
};

// 单个标签组件
const TagItem = memo(({ 
  tag, 
  onRemove
}: { 
  tag: string; 
  onRemove: (tag: string, e?: React.MouseEvent<HTMLElement>) => void 
}) => (
  <Tag
    color={getTagColor(tag)}
    closable
    onClose={(e) => onRemove(tag, e)}
    style={{ 
      marginBottom: 8, 
      userSelect: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0 7px'
    }}
    closeIcon={<CloseOutlined style={{ fontSize: '10px' }} />}
  >
    {tag}
  </Tag>
));

interface TagsSelectorProps extends SectionProps {
  existingTags?: string[];
}

/**
 * 标签选择组件
 */
const TagsSelector: React.FC<TagsSelectorProps> = ({ form, existingTags = [], onChange }) => {
  // 使用标签选择器钩子
  const {
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
  } = useTagsSelector({ form, existingTags, onChange });

  // 渲染分类标签选项
  const renderTagOptions = useMemo(() => {
    if (!isInputFocused || (newTag && tagOptions.length === 0)) {
      return undefined;
    }

    // 如果有搜索词，则只显示过滤后的选项
    if (newTag) {
      return tagOptions.map(opt => ({
        value: opt.value,
        label: opt.value
      }));
    }

    // 没有搜索词时显示分类标签
    const options: OptionType[] = [];
    
    // 最近使用的标签
    if (recentlyUsedTags.length > 0) {
      options.push({
        label: <Divider orientation="left" style={{ margin: '4px 0' }}>最近使用</Divider>,
        options: recentlyUsedTags.map((tag: string) => ({
          value: tag,
          label: <span><Tag color={getTagColor(tag)} style={{ margin: 0 }}>{tag}</Tag></span>
        }))
      });
    }
    
    // 分类标签
    Object.entries(categorizedTags).forEach(([category, categoryTags]) => {
      if (categoryTags.length > 0) {
        options.push({
          label: <Divider orientation="left" style={{ margin: '4px 0' }}>{category}</Divider>,
          options: (categoryTags as string[]).map((tag: string) => ({
            value: tag,
            label: <span><Tag color={getTagColor(tag)} style={{ margin: 0 }}>{tag}</Tag></span>
          }))
        });
      }
    });
    
    return options;
  }, [isInputFocused, newTag, tagOptions, recentlyUsedTags, categorizedTags]);

  // 渲染已选标签列表
  const renderedTags = useMemo(() => (
    <div style={{ 
      marginBottom: '8px', 
      minHeight: '32px', 
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px'
    }}>
      {tags.length > 0 ? (
        tags.map((tag) => (
          <TagItem key={tag} tag={tag} onRemove={handleRemoveTag} />
        ))
      ) : (
        <div style={{ color: '#ff4d4f', marginBottom: 8 }}>请至少添加一个标签</div>
      )}
    </div>
  ), [tags, handleRemoveTag]);

  return (
    <Form.Item 
      label="标签" 
      required 
      tooltip="至少添加1个标签，最多可添加100个标签"
      rules={tagsValidators}
      name="tags"
      validateTrigger={['onChange', 'onBlur']}
    >
      {renderedTags}
      <Space>
        <AutoComplete
          value={newTag}
          options={renderTagOptions}
          onSelect={handleTagSelect}
          onChange={handleTagInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="输入标签，支持自动补全，按回车添加"
          style={{ width: 300 }}
          onKeyDown={handleTagInputKeyPress}
          disabled={tags.length >= 100}
          open={isInputFocused && (tagOptions.length > 0 || recentlyUsedTags.length > 0)}
          notFoundContent={newTag ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的标签" /> : null}
          dropdownStyle={{ maxHeight: '400px', overflow: 'auto' }}
          dropdownMatchSelectWidth={true}
          filterOption={false} // 关闭内置过滤，使用我们自己的过滤逻辑
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddTag}
          disabled={!newTag || tags.includes(newTag) || tags.length >= 100}
        >
          添加
        </Button>
      </Space>
      <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
        已添加 {tags.length}/100 个标签
      </div>
    </Form.Item>
  );
};

export default memo(TagsSelector); 