import * as React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { Solution } from '../types';
import { memo } from 'react';

interface SolutionItemProps {
  solution: Solution;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  isDraggable?: boolean;
}

/**
 * 参考资料项目组件
 */
const SolutionItem: React.FC<SolutionItemProps> = memo(({ 
  solution, 
  index, 
  onEdit, 
  onRemove,
  isDraggable = false
}) => {
  const containerStyle = {
    marginBottom: '16px',
    padding: '8px',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    transition: 'box-shadow 0.2s, transform 0.1s',
    background: '#fff',
    boxShadow: isDraggable ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
    cursor: isDraggable ? 'grab' : 'default',
    position: 'relative' as const,
  };

  return (
    <div style={containerStyle}>
      <Space style={{ marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isDraggable && (
            <Tooltip title="拖动调整顺序">
              <DragOutlined 
                style={{ 
                  marginRight: 8, 
                  color: '#999',
                  cursor: 'grab',
                  fontSize: '16px'
                }}
              />
            </Tooltip>
          )}
          <div>
            <strong>标题:</strong> {solution.title}
            {solution.source && <> | <strong>来源:</strong> {solution.source}</>}
            {solution.author && <> | <strong>作者:</strong> {solution.author}</>}
          </div>
        </div>
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(index)} type="text">
            编辑
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onRemove(index)} type="text">
            删除
          </Button>
        </Space>
      </Space>
      <div>
        <a href={solution.url} target="_blank" rel="noopener noreferrer">{solution.url}</a>
      </div>
    </div>
  );
});

export default SolutionItem; 