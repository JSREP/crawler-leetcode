import * as React from 'react';
import { Button, Modal } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册YAML语言
SyntaxHighlighter.registerLanguage('yaml', yaml);

// 自定义高亮主题
const highlightTheme = {
  ...vs,
  hljs: {
    ...vs.hljs,
    background: '#f8f8f8'
  }
};

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

  // 复制并关闭Modal
  const handleCopyAndClose = () => {
    onCopyYaml();
    setIsModalVisible(false);
  };

  return (
    <>
      <div style={{ marginBottom: 16, marginTop: 24 }}>
        <Button 
          type="primary" 
          onClick={showModal}
          icon={<CopyOutlined />}
        >
          预览YAML
        </Button>
      </div>
      
      <Modal
        title="预览YAML代码"
        open={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            关闭
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopyAndClose}>
            复制YAML
          </Button>
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <SyntaxHighlighter 
            language="yaml" 
            style={highlightTheme}
            customStyle={{
              borderRadius: '4px',
              fontSize: '14px',
              lineHeight: '1.5',
              maxHeight: '60vh',
              overflow: 'auto',
              padding: '16px',
              border: '1px solid #eaeaea'
            }}
            showLineNumbers={true}
            wrapLongLines={true}
          >
            {yamlOutput}
          </SyntaxHighlighter>
        </div>
      </Modal>
    </>
  );
};

export default YamlPreviewSection; 