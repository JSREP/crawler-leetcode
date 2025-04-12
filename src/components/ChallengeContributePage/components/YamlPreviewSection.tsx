import * as React from 'react';
import { Typography, Button, Modal, Space } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface YamlPreviewSectionProps {
  yamlOutput: string;
  onGenerateYaml: () => void;
  onCopyYaml: () => void;
}

/**
 * YAML预览部分组件
 */
const YamlPreviewSection: React.FC<YamlPreviewSectionProps> = ({
  yamlOutput,
  onGenerateYaml,
  onCopyYaml
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);

  const showModal = () => {
    onGenerateYaml(); // 先生成YAML
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 代码块样式
  const codeBlockStyle = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '16px',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    overflow: 'auto',
    maxHeight: '60vh',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const
  };

  return (
    <>
      <div style={{ marginBottom: 16, marginTop: 24 }}>
        <Button 
          type="primary" 
          onClick={showModal}
          icon={<CopyOutlined />}
        >
          生成YAML
        </Button>
      </div>
      
      <Modal
        title="生成的YAML代码"
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            关闭
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={onCopyYaml}>
            复制YAML
          </Button>
        ]}
      >
        <Paragraph>
          <div style={codeBlockStyle}>
            {yamlOutput}
          </div>
        </Paragraph>
      </Modal>
    </>
  );
};

export default YamlPreviewSection; 