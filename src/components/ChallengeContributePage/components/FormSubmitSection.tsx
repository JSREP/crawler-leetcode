import * as React from 'react';
import { Button, Space, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

interface FormSubmitSectionProps {
  onFinish: () => void;
  onGenerateYaml: () => void;
  isFormDirty: boolean;
  isSubmitting: boolean;
  isSubmitSuccess: boolean;
  submitErrorMessage: string | null;
}

/**
 * 表单提交部分组件
 */
const FormSubmitSection: React.FC<FormSubmitSectionProps> = ({
  onFinish,
  onGenerateYaml,
  isFormDirty,
  isSubmitting,
  isSubmitSuccess,
  submitErrorMessage
}) => {
  return (
    <div style={{ marginTop: 24, marginBottom: 48 }}>
      {/* 错误消息 */}
      {submitErrorMessage && (
        <Alert
          message="提交失败"
          description={submitErrorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 成功消息 */}
      {isSubmitSuccess && (
        <Alert
          message="提交成功"
          description="挑战已成功提交，感谢您的贡献！"
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 提交按钮 */}
      <Space size="middle">
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onFinish}
          loading={isSubmitting}
          disabled={!isFormDirty || isSubmitting}
        >
          提交
        </Button>
        
        {/* 已移除生成YAML按钮，该功能已移至YamlPreviewSection组件 */}
        
        {!isFormDirty && (
          <span style={{ color: '#999' }}>请先修改表单内容</span>
        )}
      </Space>
    </div>
  );
};

export default FormSubmitSection; 