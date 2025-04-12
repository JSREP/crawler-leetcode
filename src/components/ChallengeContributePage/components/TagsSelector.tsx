import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Tag, AutoComplete, Button, Space, FormInstance, message } from 'antd';
import { SectionProps } from '../types';

interface TagsSelectorProps extends SectionProps {
  existingTags?: string[];
}

/**
 * 标签选择组件
 */
const TagsSelector: React.FC<TagsSelectorProps> = ({ form, existingTags = [] }) => {
  const [newTag, setNewTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<{ value: string }[]>([]);

  // 初始化时从表单获取已有标签
  useEffect(() => {
    const formTags = form.getFieldValue('tags');
    if (formTags && Array.isArray(formTags) && formTags.length > 0) {
      setTags(formTags);
    }
  }, [form]);

  // 监听全局tags-updated事件，用于YAML导入时更新标签
  useEffect(() => {
    const handleTagsUpdated = (event: CustomEvent) => {
      if (event.detail && event.detail.tags && Array.isArray(event.detail.tags)) {
        setTags(event.detail.tags);
      }
    };

    window.addEventListener('tags-updated', handleTagsUpdated as EventListener);
    
    // 清理事件监听
    return () => {
      window.removeEventListener('tags-updated', handleTagsUpdated as EventListener);
    };
  }, []);

  // 当用户输入标签时，更新自动完成选项
  useEffect(() => {
    if (newTag) {
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(newTag.toLowerCase()));
      setTagOptions(filtered.map(tag => ({ value: tag })));
    } else {
      setTagOptions([]);
    }
  }, [newTag, existingTags]);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      if (tags.length >= 100) {
        message.warning('最多只能添加100个标签');
        return;
      }
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setNewTag('');
      
      // 更新表单字段
      form.setFieldsValue({ tags: updatedTags });
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    const updatedTags = tags.filter(tag => tag !== removedTag);
    setTags(updatedTags);
    
    // 更新表单字段
    form.setFieldsValue({ tags: updatedTags });
  };

  const handleTagInputChange = (value: string) => {
    setNewTag(value);
  };

  const handleTagSelect = (value: string) => {
    if (!tags.includes(value)) {
      const updatedTags = [...tags, value];
      setTags(updatedTags);
      setNewTag('');
      
      // 更新表单字段
      form.setFieldsValue({ tags: updatedTags });
    }
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Form.Item 
      label="标签" 
      required 
      tooltip="至少添加1个标签，最多可添加100个标签"
    >
      <div style={{ marginBottom: '8px' }}>
        {tags.map((tag, index) => (
          <Tag
            key={index}
            closable
            onClose={() => handleRemoveTag(tag)}
            style={{ marginBottom: 8 }}
          >
            {tag}
          </Tag>
        ))}
        {tags.length === 0 && (
          <div style={{ color: '#ff4d4f', marginBottom: 8 }}>请至少添加一个标签</div>
        )}
      </div>
      <Space>
        <AutoComplete
          value={newTag}
          options={tagOptions}
          onSelect={handleTagSelect}
          onChange={handleTagInputChange}
          placeholder="输入标签，支持自动补全，按回车添加"
          style={{ width: 300 }}
          onKeyDown={handleTagInputKeyPress}
          disabled={tags.length >= 100}
        />
        <Button 
          type="primary" 
          onClick={handleAddTag}
          disabled={!newTag || tags.includes(newTag) || tags.length >= 100}
        >
          添加
        </Button>
      </Space>
      <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
        已添加 {tags.length}/100 个标签
      </div>
      
      {/* 隐藏的表单项，用于存储标签数据 */}
      <Form.Item name="tags" hidden>
        <input type="hidden" />
      </Form.Item>
    </Form.Item>
  );
};

export default TagsSelector; 