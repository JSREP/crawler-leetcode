import * as React from 'react';
import { Button, Input, Tabs, Upload, Space, Modal, message } from 'antd';
import { ImportOutlined, LinkOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import * as jsYaml from 'js-yaml';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface YamlImportSectionProps {
  onImportYaml: (yamlContent: string) => void;
}

/**
 * YAML导入组件，支持文件导入、URL导入和粘贴导入
 */
const YamlImportSection: React.FC<YamlImportSectionProps> = ({
  onImportYaml
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [yamlUrl, setYamlUrl] = React.useState<string>('');
  const [yamlText, setYamlText] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<string>('file');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // 显示导入对话框
  const showImportModal = () => {
    setIsModalVisible(true);
    // 重置状态
    setYamlUrl('');
    setYamlText('');
    setActiveTab('file');
  };

  // 关闭导入对话框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

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
  const handleFileImport: UploadProps['beforeUpload'] = (file: RcFile) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        if (validateYaml(content)) {
          onImportYaml(content);
          message.success('YAML文件导入成功');
          setIsModalVisible(false);
        }
      } catch (error) {
        console.error('读取文件失败:', error);
        message.error('读取文件失败');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      message.error('文件读取失败');
      setIsLoading(false);
    };
    reader.readAsText(file);
    
    // 阻止自动上传
    return false;
  };

  // 处理URL导入
  const handleUrlImport = async () => {
    if (!yamlUrl.trim()) {
      message.error('请输入有效的URL');
      return;
    }

    setIsLoading(true);
    try {
      // 使用代理避免CORS问题
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${yamlUrl}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP错误 ${response.status}`);
      }
      
      const content = await response.text();
      if (validateYaml(content)) {
        onImportYaml(content);
        message.success('从URL导入YAML成功');
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('从URL获取YAML失败:', error);
      message.error('无法从URL获取YAML，请确保URL可访问且包含有效的YAML');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理粘贴导入
  const handleTextImport = () => {
    if (!yamlText.trim()) {
      message.error('请粘贴YAML内容');
      return;
    }

    if (validateYaml(yamlText)) {
      onImportYaml(yamlText);
      message.success('粘贴的YAML导入成功');
      setIsModalVisible(false);
    }
  };

  // 选择当前活动的导入方式
  const handleImport = () => {
    switch (activeTab) {
      case 'url':
        handleUrlImport();
        break;
      case 'text':
        handleTextImport();
        break;
      default:
        // 文件导入在Upload组件中处理
        message.info('请选择文件上传');
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<ImportOutlined />}
        size="large"
        block
        style={{ height: '50px', fontSize: '16px', marginBottom: 24 }}
        onClick={showImportModal}
      >
        导入YAML文件
      </Button>

      <Modal
        title="导入YAML"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          activeTab !== 'text' ? (
            <Button 
              key="import" 
              type="primary" 
              onClick={handleImport}
              loading={isLoading}
              disabled={activeTab === 'file'}
            >
              导入
            </Button>
          ) : null
        ].filter(Boolean)}
        width={600}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                本地文件
              </span>
            } 
            key="file"
          >
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
                  支持 .yml 或 .yaml 格式文件，包括单个挑战或包含多个挑战的集合文件（将导入第一个挑战）
                </p>
              </Upload.Dragger>
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <LinkOutlined />
                URL导入
              </span>
            } 
            key="url"
          >
            <div style={{ padding: '16px 0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="输入包含YAML内容的URL"
                  value={yamlUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYamlUrl(e.target.value)}
                  prefix={<LinkOutlined />}
                  allowClear
                />
                <div>
                  <p style={{ color: '#999', marginTop: 8 }}>
                    输入包含YAML内容的文件URL，点击导入按钮获取并解析内容。
                    支持单个挑战或包含多个挑战的集合文件（将导入第一个挑战）。
                  </p>
                </div>
              </Space>
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CopyOutlined />
                粘贴导入
              </span>
            } 
            key="text"
          >
            <div style={{ padding: '16px 0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <TextArea
                  placeholder="粘贴YAML内容到此处"
                  value={yamlText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setYamlText(e.target.value)}
                  autoSize={{ minRows: 6, maxRows: 12 }}
                  onPaste={(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
                    console.log('粘贴事件触发');
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: '#999', margin: '8px 0 0 0' }}>
                    将YAML内容复制粘贴到文本框中，点击导入按钮解析内容。
                    支持单个挑战或包含多个挑战的集合文件（将导入第一个挑战）。
                  </p>
                  <Button 
                    type="primary" 
                    onClick={handleTextImport}
                    disabled={!yamlText.trim()}
                  >
                    粘贴导入
                  </Button>
                </div>
              </Space>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default YamlImportSection; 