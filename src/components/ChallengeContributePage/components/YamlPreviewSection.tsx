import * as React from 'react';
import { Button, Modal, Space, message } from 'antd';
import { CopyOutlined, GithubOutlined } from '@ant-design/icons';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册YAML语言
SyntaxHighlighter.registerLanguage('yaml', yaml);

// GitHub仓库信息
const GITHUB_REPO = 'JSREP/crawler-leetcode';
const GITHUB_BASE_URL = `https://github.com/${GITHUB_REPO}`;

// YAML长度限制（超过此长度需要手动提交）
const YAML_LENGTH_LIMIT = 1000;

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
  const [isLengthWarningVisible, setIsLengthWarningVisible] = React.useState<boolean>(false);
  const [currentAction, setCurrentAction] = React.useState<'PR' | 'Issue' | null>(null);

  const showModal = () => {
    onGenerateYaml(); // 先生成YAML
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleLengthWarningCancel = () => {
    setIsLengthWarningVisible(false);
    setCurrentAction(null);
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

  // 检查YAML长度并决定是否显示警告
  const checkYamlLengthAndProceed = (action: 'PR' | 'Issue') => {
    // 如果还没有YAML，先生成
    if (!yamlOutput) {
      onGenerateYaml();
    }

    // 检查生成后的YAML长度
    if (yamlOutput.length > YAML_LENGTH_LIMIT) {
      // 设置当前操作类型
      setCurrentAction(action);
      // 显示长度警告弹窗
      setIsLengthWarningVisible(true);
      return;
    }

    // 长度在限制内，继续正常流程
    if (action === 'PR') {
      proceedToPullRequest();
    } else {
      proceedToIssue();
    }
  };

  // 手动复制YAML，用于超长情况
  const handleManualCopyYaml = () => {
    navigator.clipboard.writeText(yamlOutput)
      .then(() => {
        message.success('YAML已复制到剪贴板，请在GitHub中粘贴');
        
        // 打开相应的GitHub页面
        if (currentAction === 'PR') {
          const prUrl = `${GITHUB_BASE_URL}/compare/main...`;
          window.open(prUrl, '_blank');
        } else {
          const issueUrl = `${GITHUB_BASE_URL}/issues/new`;
          window.open(issueUrl, '_blank');
        }
        
        // 关闭警告弹窗
        setIsLengthWarningVisible(false);
        setCurrentAction(null);
      })
      .catch((error) => {
        console.error('复制YAML失败:', error);
        message.error('复制YAML失败，请手动复制后提交');
      });
  };

  // 创建Pull Request的实际实现
  const proceedToPullRequest = () => {
    if (!yamlOutput) return;

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

  // 创建Issue的实际实现
  const proceedToIssue = () => {
    if (!yamlOutput) return;

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

  // 创建Pull Request的触发函数
  const createPullRequest = () => {
    checkYamlLengthAndProceed('PR');
  };

  // 创建Issue的触发函数
  const createIssue = () => {
    checkYamlLengthAndProceed('Issue');
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
            icon={<GithubOutlined />}
          >
            New Issue
          </Button>
        </Space>
      </div>
      
      {/* YAML预览对话框 */}
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
      
      {/* YAML长度警告对话框 */}
      <Modal
        title="YAML内容过长"
        open={isLengthWarningVisible}
        onCancel={handleLengthWarningCancel}
        footer={[
          <Button key="cancel" onClick={handleLengthWarningCancel}>
            取消
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleManualCopyYaml}>
            复制YAML并继续
          </Button>
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          <p>生成的YAML内容超过了{YAML_LENGTH_LIMIT}个字符，无法通过URL参数直接传递。</p>
          <p>请使用以下步骤手动提交:</p>
          <ol>
            <li>点击下方的"复制YAML并继续"按钮将YAML内容复制到剪贴板</li>
            <li>然后会自动跳转到GitHub {currentAction === 'PR' ? 'Pull Request' : 'Issue'} 创建页面</li>
            <li>在GitHub页面上，填写标题和描述</li>
            <li>将YAML内容粘贴到描述区域中的合适位置</li>
            <li>提交{currentAction === 'PR' ? 'Pull Request' : 'Issue'}</li>
          </ol>
        </div>
      </Modal>
    </>
  );
};

export default YamlPreviewSection; 