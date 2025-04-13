import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Space, message, Typography, Input, Alert, Modal, Card, Divider, Tooltip } from 'antd';
import { CopyOutlined, FileTextOutlined, DownloadOutlined, CheckOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
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
  // 添加调试输出
  console.log('YamlPreviewContent 渲染，YAML长度:', yamlOutput?.length || 0);
  
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
  const [displayYaml, setDisplayYaml] = useState<string>('');
  
  // 监听yamlOutput变化
  useEffect(() => {
    console.log('YamlPreviewSection 接收到 yamlOutput 更新，长度:', yamlOutput?.length || 0);
    setDisplayYaml(yamlOutput);
  }, [yamlOutput]);

  // 处理YAML下载
  const handleDownloadYaml = () => {
    if (!displayYaml) {
      message.warning('请先生成YAML', 2);
      return;
    }
    setShowDownloadModal(true);
  };

  // 增强复制功能
  const handleEnhancedCopy = () => {
    if (!displayYaml) {
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
    if (!displayYaml) return;
    
    const element = document.createElement('a');
    const file = new Blob([displayYaml], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = downloadFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setShowDownloadModal(false);
    message.success(`已下载 ${downloadFileName}`, 2);
  };
  
  // 处理刷新YAML
  const handleRefreshYaml = () => {
    console.log('手动刷新YAML');
    onGenerateYaml();
  };

  return (
    <div style={{ marginTop: 20, marginBottom: 40 }} className="yaml-preview-section" id="yaml-preview-section">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            <span>YAML预览</span>
            {displayYaml ? (
              <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                (内容长度: {displayYaml.length})
              </Text>
            ) : null}
          </div>
        }
        extra={
          <Space>
            <Button 
              type="primary"
              icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleEnhancedCopy}
              style={{ backgroundColor: isCopied ? '#52c41a' : undefined }}
              disabled={!displayYaml}
            >
              {isCopied ? '已复制' : '复制YAML'}
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadYaml}
              disabled={!displayYaml}
            >
              下载
            </Button>
            
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefreshYaml}
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
        <YamlPreviewContent yamlOutput={displayYaml} />
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button 
              type="primary"
              onClick={handleRefreshYaml}
              icon={<ReloadOutlined />}
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
        />
      </Modal>
    </div>
  );
};

export default YamlPreviewSection; 