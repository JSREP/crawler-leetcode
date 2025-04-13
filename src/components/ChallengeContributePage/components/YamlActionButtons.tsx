import * as React from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';

interface YamlActionButtonsProps {
  yamlOutput: string;
  onCopyYaml: () => void;
  onDownloadYaml: () => void;
}

/**
 * YAML操作按钮组件
 */
const YamlActionButtons: React.FC<YamlActionButtonsProps> = ({
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
      <Button
        icon={<CopyOutlined />}
        onClick={handleCopyClick}
      >
        复制YAML
      </Button>
      
      <Button
        icon={<DownloadOutlined />}
        onClick={handleDownloadClick}
      >
        下载YAML
      </Button>
    </>
  );
};

export default YamlActionButtons; 