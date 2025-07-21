import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Select, FormInstance } from 'antd';
import StarRating from '../../StarRating';

const { Option } = Select;

interface DifficultySelectorProps {
  form: FormInstance;
  value?: number;
  onChange?: (value: number) => void;
}

/**
 * 难度选择组件
 */
const DifficultySelector: React.FC<DifficultySelectorProps> = ({ form, value, onChange }) => {
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(value || 1);

  // 监听表单中难度级别的变化
  useEffect(() => {
    const formDifficulty = form.getFieldValue('difficultyLevel');
    if (formDifficulty && formDifficulty !== currentDifficulty) {
      setCurrentDifficulty(formDifficulty);
    }
  }, [form, currentDifficulty]);

  // 难度级别变化处理
  const handleDifficultyChange = (value: number) => {
    setCurrentDifficulty(value);
    form.setFieldsValue({ difficultyLevel: value });
    
    if (onChange) {
      onChange(value);
    }
  };

  // 空函数，只用于让星星显示为可点击状态
  const handleStarClick = () => {};

  return (
    <Form.Item
      name="difficultyLevel"
      label="难度级别"
      rules={[{ required: true, message: '请选择难度级别' }]}
    >
      <Select 
        style={{ width: 'auto', minWidth: '180px' }}
        onChange={handleDifficultyChange}
        value={currentDifficulty}
        dropdownStyle={{ minWidth: '250px' }}
        placeholder="请选择难度级别"
        popupMatchSelectWidth={false}
      >
        <Option value={1}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>1 (初级)</span>
            <StarRating 
              difficulty={1} 
              onClick={handleStarClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Option>
        <Option value={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>2 (简单)</span>
            <StarRating 
              difficulty={2} 
              onClick={handleStarClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Option>
        <Option value={3}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>3 (中等)</span>
            <StarRating 
              difficulty={3} 
              onClick={handleStarClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Option>
        <Option value={4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>4 (困难)</span>
            <StarRating 
              difficulty={4} 
              onClick={handleStarClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Option>
        <Option value={5}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>5 (专家)</span>
            <StarRating 
              difficulty={5} 
              onClick={handleStarClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Option>
      </Select>
    </Form.Item>
  );
};

export default DifficultySelector; 