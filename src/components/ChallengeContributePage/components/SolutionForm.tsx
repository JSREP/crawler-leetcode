import * as React from 'react';
import { Input, Button, AutoComplete, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Solution } from '../types';

interface SolutionFormProps {
  solution: Solution;
  authors: string[];
  urlError: string;
  isEditing: boolean;
  onSolutionChange: (field: keyof Solution, value: string) => void;
  onAddSolution: () => void;
  onCancelEditing: () => void;
}

/**
 * 参考资料表单组件
 */
const SolutionForm: React.FC<SolutionFormProps> = ({ 
  solution, 
  authors, 
  urlError, 
  isEditing,
  onSolutionChange, 
  onAddSolution, 
  onCancelEditing 
}) => {
  return (
    <div className="solutions-form-wrapper" style={{ marginTop: 16 }}>
      <div 
        className="form-item"
        style={{ marginBottom: 24 }}
      >
        <div className="form-item-label" style={{ marginBottom: 8 }}>
          <label className="ant-form-item-required">标题</label>
        </div>
        <div className="form-item-control">
          <Input 
            value={solution.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSolutionChange('title', e.target.value)}
            placeholder="如: 使用正则表达式解析URL"
          />
          <div className="form-item-help" style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            请输入参考资料的标题
          </div>
        </div>
      </div>

      <div 
        className="form-item"
        style={{ marginBottom: 24 }}
      >
        <div className="form-item-label" style={{ marginBottom: 8 }}>
          <label className="ant-form-item-required">URL</label>
        </div>
        <div className="form-item-control">
          <Input 
            value={solution.url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSolutionChange('url', e.target.value)}
            placeholder="如: https://github.com/your-repo"
            status={urlError ? "error" : undefined}
          />
          <div className="form-item-help" style={{ fontSize: 12, color: urlError ? '#ff4d4f' : '#999', marginTop: 4 }}>
            {urlError || "请输入参考资料的链接地址"}
          </div>
        </div>
      </div>

      <div 
        className="form-item"
        style={{ marginBottom: 24 }}
      >
        <div className="form-item-label" style={{ marginBottom: 8 }}>
          <label>来源</label>
        </div>
        <div className="form-item-control">
          <Input 
            value={solution.source}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSolutionChange('source', e.target.value)}
            placeholder="如: GitHub"
          />
          <div className="form-item-help" style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            可选，会根据URL自动填充
          </div>
        </div>
      </div>

      <div 
        className="form-item"
        style={{ marginBottom: 24 }}
      >
        <div className="form-item-label" style={{ marginBottom: 8 }}>
          <label>作者</label>
        </div>
        <div className="form-item-control">
          <AutoComplete
            value={solution.author}
            onChange={(value) => onSolutionChange('author', value)}
            options={authors.map(author => ({ value: author }))}
            placeholder="请输入作者名称"
            filterOption={(inputValue, option) =>
              option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          />
          <div className="form-item-help" style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            可选，支持自动补全已有作者
          </div>
        </div>
      </div>

      <Space>
        <Button 
          type="dashed" 
          onClick={onAddSolution}
          icon={<PlusOutlined />}
          disabled={!solution.title || !solution.url || !!urlError}
        >
          {isEditing ? '更新参考资料' : '添加参考资料'}
        </Button>
        
        {isEditing && (
          <Button onClick={onCancelEditing}>
            取消编辑
          </Button>
        )}
      </Space>
    </div>
  );
};

export default SolutionForm; 