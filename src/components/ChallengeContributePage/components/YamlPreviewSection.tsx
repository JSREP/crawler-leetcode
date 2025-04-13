import * as React from 'react';
import { useState } from 'react';
import { Button, Space, message, Typography, Input, Alert, Modal, Card, Divider, Tooltip } from 'antd';
import { CopyOutlined, FileTextOutlined, DownloadOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { styles } from '../styles';

const { Text, Title } = Typography;

interface YamlPreviewSectionProps {
  yamlOutput: string;
  onGenerateYaml: () => void;
  onCopyYaml: () => void;
}

/**
 * YAML预览内容组件
 */
const YamlPreviewContent: React.FC<{ yamlOutput: string }> = ({ yamlOutput }) => {
  if (!yamlOutput) {
    return (
      <Alert
        message="尚未生成YAML"
        description="请填写表单并点击'生成YAML'按钮来预览YAML内容"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div style={styles.yamlPreview}>
      <SyntaxHighlighter
        language="yaml"
        style={tomorrow}
        customStyle={{ 
          fontSize: '14px', 
          lineHeight: '1.5', 
          padding: '16px',
          margin: 0,
          backgroundColor: 'transparent',
          border: 'none'
        }}
        showLineNumbers={true}
      >
        {yamlOutput}
      </SyntaxHighlighter>
    </div>
  );
};

/**
 * YAML操作按钮组件
 */
const YamlActionButtons: React.FC<{ 
  yamlOutput: string; 
  onCopyYaml: () => void; 
  onDownloadYaml: () => void; 
}> = ({
  yamlOutput,
  onCopyYaml,
  onDownloadYaml
}) => {
  // 处理点击复制按钮
  const handleCopyClick = () => {
    if (!yamlOutput) {
      message.warning('请先生成YAML', 2);
      return;
    }
    onCopyYaml();
  };

  // 处理点击下载按钮
  const handleDownloadClick = () => {
    if (!yamlOutput) {
      message.warning('请先生成YAML', 2);
      return;
    }
    onDownloadYaml();
  };

  return (
    <>
      <Tooltip title="复制YAML内容到剪贴板">
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopyClick}
        >
          复制YAML
        </Button>
      </Tooltip>
      
      <Tooltip title="将YAML内容下载为文件">
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadClick}
        >
          下载YAML
        </Button>
      </Tooltip>
    </>
  );
};

/**
 * YAML预览和操作区域
 */
const YamlPreviewSection: React.FC<YamlPreviewSectionProps> = ({
  yamlOutput,
  onGenerateYaml,
  onCopyYaml
}) => {
  // 状态
  const [downloadFileName, setDownloadFileName] = useState<string>('challenge.yaml');
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 处理YAML下载
  const handleDownloadYaml = () => {
    if (!yamlOutput) {
      message.warning('请先生成YAML', 2);
      return;
    }
    setShowDownloadModal(true);
  };

  // 增强复制功能
  const handleEnhancedCopy = () => {
    if (!yamlOutput) {
      message.warning('请先生成YAML', 2);
      return;
    }
    
    onCopyYaml();
    setIsCopied(true);
    
    // 3秒后重置复制状态
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  // 确认下载
  const confirmDownload = () => {
    if (!yamlOutput) return;
    
    const element = document.createElement('a');
    const file = new Blob([yamlOutput], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = downloadFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setShowDownloadModal(false);
    message.success(`已下载 ${downloadFileName}`, 2);
  };

  return (
    <div style={{ marginTop: 20, marginBottom: 40 }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            <span>YAML预览</span>
          </div>
        }
        extra={
          <Space>
            <Button 
              type="primary"
              icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleEnhancedCopy}
              style={{ backgroundColor: isCopied ? '#52c41a' : undefined }}
            >
              {isCopied ? '已复制' : '复制YAML'}
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadYaml}
            >
              下载
            </Button>
            
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={onGenerateYaml}
            >
              刷新YAML
            </Button>
          </Space>
        }
      >
        <Alert
          message="下面是生成的YAML内容"
          description={
            <Text type="secondary">
              YAML文件包含了所有表单数据，可用于提交挑战。如需修改，请返回前面的步骤修改表单内容，然后点击"刷新YAML"按钮更新。
            </Text>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
        />

        {/* YAML内容预览 */}
        <YamlPreviewContent yamlOutput={yamlOutput} />
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button 
              type="primary"
              onClick={onGenerateYaml}
            >
              刷新YAML内容
            </Button>
          </Space>
        </div>
      </Card>

      {/* 下载文件名输入弹窗 */}
      <Modal
        title={
          <Space>
            <DownloadOutlined />
            <span>下载YAML文件</span>
          </Space>
        }
        open={showDownloadModal}
        onOk={confirmDownload}
        onCancel={() => setShowDownloadModal(false)}
        okText="下载"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>请输入文件名：</Text>
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            文件将保存为YAML格式，可直接用于提交。
          </Text>
        </div>
        <Input
          value={downloadFileName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDownloadFileName(e.target.value)}
          placeholder="challenge.yaml"
          suffix=".yaml"
          addonBefore={<FileTextOutlined />}
        />
      </Modal>
    </div>
  );
};

export default YamlPreviewSection; 