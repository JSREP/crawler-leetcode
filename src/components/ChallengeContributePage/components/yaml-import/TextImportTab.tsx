import * as React from 'react';
import { Input, Space, message } from 'antd';
import * as jsYaml from 'js-yaml';

const { TextArea } = Input;

interface TextImportTabProps {
  yamlText: string;
  setYamlText: (text: string) => void;
  onImport: (content: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * 文本粘贴导入标签页组件
 */
const TextImportTab: React.FC<TextImportTabProps> = ({ 
  yamlText, 
  setYamlText, 
  onImport, 
  setLoading 
}) => {
  // 验证YAML内容
  const validateYaml = (content: string): boolean => {
    try {
      jsYaml.load(content);
      return true;
    } catch (error) {
      console.error('YAML解析失败:', error);
      message.error('YAML格式错误，请检查内容');
      return false;
    }
  };

  // 处理文本导入
  const handleTextImport = () => {
    if (!yamlText.trim()) {
      message.error('请粘贴YAML内容');
      return;
    }

    setLoading(true);
    try {
      if (validateYaml(yamlText)) {
        onImport(yamlText);
        message.success('粘贴的YAML导入成功');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // 将handleTextImport方法暴露给父组件
    const handleEvent = (event: CustomEvent) => {
      if (event.detail?.action === 'import-text') {
        handleTextImport();
      }
    };
    
    window.addEventListener('yaml-import-action', handleEvent as EventListener);
    
    return () => {
      window.removeEventListener('yaml-import-action', handleEvent as EventListener);
    };
  }, [yamlText]);

  return (
    <div style={{ padding: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <TextArea
          placeholder="粘贴YAML内容到此处"
          value={yamlText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setYamlText(e.target.value)}
          autoSize={{ minRows: 8, maxRows: 16 }}
          style={{ 
            resize: 'none',
            backgroundColor: '#fafafa',
            border: '1px dashed #d9d9d9',
            borderRadius: '4px',
            padding: '12px'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
          <p style={{ color: '#999', margin: 0, flex: 1 }}>
            将YAML内容复制粘贴到文本框中，点击底部的【粘贴导入】按钮解析内容。
            支持单个挑战或包含多个挑战的集合文件（将导入第一个挑战）。
          </p>
        </div>
      </Space>
    </div>
  );
};

export default TextImportTab; 