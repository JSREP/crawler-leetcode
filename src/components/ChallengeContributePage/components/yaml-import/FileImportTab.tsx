import * as React from 'react';
import { Upload, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import * as jsYaml from 'js-yaml';

interface FileImportTabProps {
  onImport: (content: string) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * 文件导入标签页组件
 */
const FileImportTab: React.FC<FileImportTabProps> = ({ onImport, setLoading }) => {
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

  // 处理文件导入
  const handleFileImport = (file: RcFile) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        if (validateYaml(content)) {
          onImport(content);
          message.success('YAML文件导入成功');
        }
      } catch (error) {
        console.error('读取文件失败:', error);
        message.error('读取文件失败');
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      message.error('文件读取失败');
      setLoading(false);
    };
    
    reader.readAsText(file);
    
    // 阻止自动上传
    return false;
  };

  return (
    <div style={{ padding: '16px 0' }}>
      <Upload.Dragger
        accept=".yml,.yaml"
        showUploadList={false}
        beforeUpload={handleFileImport}
        multiple={false}
      >
        <p className="ant-upload-drag-icon">
          <FileTextOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 .yml 或 .yaml 格式文件
        </p>
      </Upload.Dragger>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
        <p style={{ color: '#999', margin: 0, flex: 1 }}>
          点击或拖拽YAML文件到上方区域。支持单个挑战或包含多个挑战的集合文件（将导入第一个挑战）。
        </p>
      </div>
    </div>
  );
};

export default FileImportTab; 