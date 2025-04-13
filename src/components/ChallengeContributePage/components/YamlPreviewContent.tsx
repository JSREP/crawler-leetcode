import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Alert } from 'antd';

interface YamlPreviewContentProps {
  yamlOutput: string;
}

/**
 * YAML内容预览组件
 */
const YamlPreviewContent: React.FC<YamlPreviewContentProps> = ({ yamlOutput }) => {
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
    <div style={{ 
      border: '1px solid #d9d9d9', 
      borderRadius: '2px',
      marginTop: 16,
      maxHeight: '70vh',
      overflowY: 'auto' 
    }}>
      <SyntaxHighlighter
        language="yaml"
        style={tomorrow}
        customStyle={{ 
          fontSize: '14px', 
          lineHeight: '1.5', 
          padding: '16px',
          margin: 0
        }}
        showLineNumbers={true}
      >
        {yamlOutput}
      </SyntaxHighlighter>
    </div>
  );
};

export default YamlPreviewContent; 