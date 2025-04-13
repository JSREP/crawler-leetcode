import * as React from 'react';
import { Button, Tabs, Modal } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import FileImportTab from './yaml-import/FileImportTab';
import UrlImportTab from './yaml-import/UrlImportTab';
import TextImportTab from './yaml-import/TextImportTab';

const { TabPane } = Tabs;

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

  // 处理成功导入
  const handleSuccessImport = (content: string) => {
    onImportYaml(content);
    setIsModalVisible(false);
  };

  // 触发当前标签页的导入操作
  const handleImport = () => {
    if (activeTab === 'url') {
      // 触发URL导入
      window.dispatchEvent(
        new CustomEvent('yaml-import-action', { 
          detail: { action: 'import-url' } 
        })
      );
    } else if (activeTab === 'text') {
      // 触发文本导入
      window.dispatchEvent(
        new CustomEvent('yaml-import-action', { 
          detail: { action: 'import-text' } 
        })
      );
    }
  };

  // 根据当前标签页渲染底部按钮
  const renderFooterButtons = () => {
    const cancelButton = (
      <Button key="cancel" onClick={handleCancel}>
        取消
      </Button>
    );

    // 不同标签页的确认按钮
    const actionButton = activeTab === 'text' ? (
      <Button 
        key="text-import" 
        type="primary" 
        onClick={handleImport}
        loading={isLoading}
        disabled={!yamlText.trim()}
      >
        粘贴导入
      </Button>
    ) : (
      <Button 
        key="import" 
        type="primary" 
        onClick={handleImport}
        loading={isLoading}
        disabled={activeTab === 'file'}
      >
        导入
      </Button>
    );

    return [cancelButton, actionButton];
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
        footer={renderFooterButtons()}
        width={600}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="本地文件" key="file">
            <FileImportTab 
              onImport={handleSuccessImport} 
              setLoading={setIsLoading} 
            />
          </TabPane>
          
          <TabPane tab="URL导入" key="url">
            <UrlImportTab 
              yamlUrl={yamlUrl}
              setYamlUrl={setYamlUrl}
              onImport={handleSuccessImport}
              setLoading={setIsLoading}
            />
          </TabPane>
          
          <TabPane tab="粘贴导入" key="text">
            <TextImportTab
              yamlText={yamlText}
              setYamlText={setYamlText}
              onImport={handleSuccessImport}
              setLoading={setIsLoading}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default YamlImportSection; 