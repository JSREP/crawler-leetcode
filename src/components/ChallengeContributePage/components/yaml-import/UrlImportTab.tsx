import * as React from 'react';
import { Input, Space, message } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import * as jsYaml from 'js-yaml';

interface UrlImportTabProps {
  yamlUrl: string;
  setYamlUrl: (url: string) => void;
  onImport: (content: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * URL导入标签页组件
 */
const UrlImportTab: React.FC<UrlImportTabProps> = ({ 
  yamlUrl, 
  setYamlUrl, 
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

  // 处理URL导入
  const handleUrlImport = async () => {
    if (!yamlUrl.trim()) {
      message.error('请输入有效的URL');
      return;
    }

    setLoading(true);
    try {
      // 使用代理避免CORS问题
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${yamlUrl}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP错误 ${response.status}`);
      }
      
      const content = await response.text();
      if (validateYaml(content)) {
        onImport(content);
        message.success('从URL导入YAML成功');
      }
    } catch (error) {
      console.error('从URL获取YAML失败:', error);
      message.error('无法从URL获取YAML，请确保URL可访问且包含有效的YAML');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // 将handleUrlImport方法暴露给父组件
    const handleEvent = (event: CustomEvent) => {
      if (event.detail?.action === 'import-url') {
        handleUrlImport();
      }
    };
    
    window.addEventListener('yaml-import-action', handleEvent as EventListener);
    
    return () => {
      window.removeEventListener('yaml-import-action', handleEvent as EventListener);
    };
  }, [yamlUrl]);

  return (
    <div style={{ padding: '16px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="输入包含YAML内容的URL"
          value={yamlUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYamlUrl(e.target.value)}
          prefix={<LinkOutlined />}
          allowClear
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <p style={{ color: '#999', margin: 0, flex: 1 }}>
            输入包含YAML内容的文件URL，点击底部的【导入】按钮获取并解析内容。
            支持单个挑战或包含多个挑战的集合文件（将导入第一个挑战）。
          </p>
        </div>
      </Space>
    </div>
  );
};

export default UrlImportTab; 