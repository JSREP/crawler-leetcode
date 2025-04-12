import * as React from 'react';
import { Button, Modal, Space, message } from 'antd';
import { CopyOutlined, GithubOutlined, BugOutlined } from '@ant-design/icons';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册YAML语言
SyntaxHighlighter.registerLanguage('yaml', yaml);

// GitHub仓库信息
const GITHUB_REPO = 'JSREP/crawler-leetcode';
const GITHUB_BASE_URL = `https://github.com/${GITHUB_REPO}`;

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

  // 提取挑战名称，用于PR和Issue标题
  const extractChallengeName = (): string => {
    try {
      // 尝试从YAML中提取name字段
      const match = yamlOutput.match(/name:\s*(.+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch (e) {
      console.error('无法提取挑战名称', e);
    }
    return '新挑战';
  };

  // 创建Pull Request
  const createPullRequest = () => {
    if (!yamlOutput) {
      message.error('请先预览YAML生成内容');
      return;
    }

    const challengeName = extractChallengeName();
    
    // 使用navigator.clipboard API复制YAML到剪贴板
    navigator.clipboard.writeText(yamlOutput)
      .then(() => {
        message.success('YAML已复制到剪贴板，请在GitHub中粘贴');
        
        // 准备PR标题和基本说明
        const title = encodeURIComponent(`新增题目: ${challengeName}`);
        const body = encodeURIComponent(
          `## 新增题目\n\n` +
          `提交一个新的挑战题目。\n\n` +
          `### YAML代码\n\n` +
          `<!-- 请在此处粘贴YAML代码 -->`
        );
        
        // 构建PR创建URL
        const prUrl = `${GITHUB_BASE_URL}/compare/main...?quick_pull=1&title=${title}&body=${body}`;
        
        // 在新标签页中打开
        window.open(prUrl, '_blank');
      })
      .catch((error) => {
        console.error('复制YAML失败:', error);
        message.error('复制YAML失败，请手动复制后提交');
      });
  };

  // 创建Issue
  const createIssue = () => {
    if (!yamlOutput) {
      message.error('请先预览YAML生成内容');
      return;
    }

    const challengeName = extractChallengeName();
    
    // 使用navigator.clipboard API复制YAML到剪贴板
    navigator.clipboard.writeText(yamlOutput)
      .then(() => {
        message.success('YAML已复制到剪贴板，请在GitHub中粘贴');
        
        // 准备Issue标题和基本说明
        const title = encodeURIComponent(`题目请求: ${challengeName}`);
        const body = encodeURIComponent(
          `## 题目请求\n\n` +
          `请求添加以下挑战题目。\n\n` +
          `### YAML代码\n\n` +
          `<!-- 请在此处粘贴YAML代码 -->`
        );
        
        // 构建Issue创建URL (使用简短参数)
        const issueUrl = `${GITHUB_BASE_URL}/issues/new?title=${title}&body=${body}`;
        
        // 在新标签页中打开
        window.open(issueUrl, '_blank');
      })
      .catch((error) => {
        console.error('复制YAML失败:', error);
        message.error('复制YAML失败，请手动复制后提交');
      });
  };

  return (
    <>
      <div style={{ marginBottom: 16, marginTop: 24 }}>
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={showModal}
            icon={<CopyOutlined />}
          >
            预览YAML
          </Button>
          
          <Button
            type="default"
            onClick={createPullRequest}
            icon={<GithubOutlined />}
          >
            Pull Request
          </Button>
          
          <Button
            type="default"
            onClick={createIssue}
            icon={<BugOutlined />}
          >
            New Issue
          </Button>
        </Space>
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
            复制
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