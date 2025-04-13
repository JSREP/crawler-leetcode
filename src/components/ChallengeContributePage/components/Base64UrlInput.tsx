import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Input, message, Tooltip, Button } from 'antd';
import { InfoCircleOutlined, LinkOutlined, ExportOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd';
import { useBase64UrlEncoder } from '../hooks';
import { createUrlValidators } from '../utils/validators';

interface Base64UrlInputProps {
  form: FormInstance;
  onChange?: (value: string) => void;
}

/**
 * 自定义Hook: 管理URL编码解码状态与操作
 */
const useBase64UrlState = (form: FormInstance, onChange?: (value: string) => void) => {
  // 状态管理
  const [plaintextUrl, setPlaintextUrl] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  
  // 编码工具
  const { encodeUrl, decodeUrl, ensureBase64Format } = useBase64UrlEncoder();
  
  // 从表单获取初始值
  const initializeFromForm = useCallback(() => {
    const base64Value = form.getFieldValue('base64Url');
    
    if (base64Value) {
      try {
        const decodedUrl = decodeUrl(base64Value);
        setPlaintextUrl(decodedUrl);
        
        // 确保表单中存储的总是base64格式
        const ensuredBase64 = ensureBase64Format(base64Value);
        if (ensuredBase64 !== base64Value) {
          form.setFieldsValue({ base64Url: ensuredBase64 });
          
          if (onChange) {
            onChange(ensuredBase64);
          }
        }
      } catch (error) {
        console.error('初始化解码失败:', error);
        setPlaintextUrl(base64Value);
      }
    }
  }, [form, decodeUrl, ensureBase64Format, onChange]);

  // 处理输入框值变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaintextUrl(e.target.value);
  }, []);

  // 处理获得焦点：显示明文
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    const base64Value = form.getFieldValue('base64Url');
    
    if (base64Value) {
      try {
        const decodedUrl = decodeUrl(base64Value);
        setPlaintextUrl(decodedUrl);
      } catch (error) {
        console.error('获取焦点时解码失败:', error);
      }
    }
  }, [form, decodeUrl]);

  // 处理失去焦点：保存base64格式
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    if (!plaintextUrl) return;
    
    // 编码为base64并更新表单
    try {
      const urlToEncode = plaintextUrl.trim();
      const base64Value = ensureBase64Format(urlToEncode);
      
      form.setFieldsValue({ base64Url: base64Value });
      
      if (onChange) {
        onChange(base64Value);
      }
      
      // 触发保存事件
      const updateEvent = new CustomEvent('form-value-updated');
      window.dispatchEvent(updateEvent);
      
      // 如果URL成功编码，显示提示
      if (base64Value !== urlToEncode) {
        message.success('URL已自动转换为Base64格式', 1);
      }
    } catch (error) {
      console.error('URL编码失败:', error);
      message.error('URL编码失败，请检查URL格式', 2);
    }
  }, [plaintextUrl, form, ensureBase64Format, onChange]);

  // 打开URL
  const openUrl = useCallback(() => {
    const base64Value = form.getFieldValue('base64Url');
    if (!base64Value) {
      message.warning('请先输入URL');
      return;
    }
    
    try {
      const url = decodeUrl(base64Value);
      // 确保URL有效
      if (!url.startsWith('http')) {
        throw new Error('无效的URL');
      }
      
      // 在新标签页中打开URL
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('打开URL失败:', error);
      message.error('无法打开URL，请检查URL格式');
    }
  }, [form, decodeUrl]);

  return {
    plaintextUrl,
    isFocused,
    initializeFromForm,
    handleInputChange,
    handleFocus, 
    handleBlur,
    decodeUrl,
    openUrl
  };
};

/**
 * 自定义Hook: 处理YAML导入事件
 */
const useYamlImportHandler = (form: FormInstance, onChange?: (value: string) => void) => {
  const { ensureBase64Format, decodeUrl } = useBase64UrlEncoder();

  useEffect(() => {
    const handleBase64UrlUpdated = (event: CustomEvent) => {
      if (event.detail && event.detail.base64Url) {
        const importedValue = event.detail.base64Url;
        
        // 确保导入的值是base64格式
        const base64Value = ensureBase64Format(importedValue);
        
        // 设置表单值
        form.setFieldsValue({ base64Url: base64Value });
        
        if (onChange) {
          onChange(base64Value);
        }
        
        // 触发保存事件
        const updateEvent = new CustomEvent('form-value-updated');
        window.dispatchEvent(updateEvent);
      }
    };

    window.addEventListener('base64-url-updated', handleBase64UrlUpdated as EventListener);
    return () => {
      window.removeEventListener('base64-url-updated', handleBase64UrlUpdated as EventListener);
    };
  }, [form, onChange, ensureBase64Format, decodeUrl]);
};

/**
 * Base64URL输入组件
 * 逻辑说明：
 * 1. 组件总是保存base64格式的URL到表单
 * 2. 用户与明文URL交互，组件内部自动处理编码和解码
 * 3. 输入框获得焦点时显示明文URL，失去焦点时自动转为base64格式
 * 4. 导入YAML时直接使用base64格式
 */
const Base64UrlInput: React.FC<Base64UrlInputProps> = ({ form, onChange }) => {
  // 使用自定义Hook管理状态和操作
  const {
    plaintextUrl,
    isFocused,
    initializeFromForm,
    handleInputChange,
    handleFocus,
    handleBlur,
    decodeUrl,
    openUrl
  } = useBase64UrlState(form, onChange);
  
  // 处理YAML导入事件
  useYamlImportHandler(form, onChange);
  
  // 组件初始化
  useEffect(() => {
    initializeFromForm();
  }, [initializeFromForm]);

  // 使用集中管理的验证规则
  const validationRules = useMemo(() => 
    createUrlValidators(decodeUrl), 
  [decodeUrl]);

  // 自定义后缀图标
  const suffixIcon = (
    <Tooltip title="在新标签页中打开URL">
      <ExportOutlined 
        onClick={openUrl} 
        style={{ cursor: 'pointer', color: '#1890ff' }} 
      />
    </Tooltip>
  );

  return (
    <Form.Item
      name="base64Url"
      label="目标网站URL"
      tooltip={{
        title: '输入普通URL，系统会自动进行Base64编码。输入框获得焦点时会显示明文，失去焦点时会显示Base64编码值。点击右侧图标可以在新标签页中打开URL。',
        icon: <InfoCircleOutlined />
      }}
      rules={validationRules}
    >
      <Input
        placeholder="请输入目标网站URL，如: https://example.com"
        value={isFocused ? plaintextUrl : form.getFieldValue('base64Url')}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        prefix={<LinkOutlined />}
        suffix={suffixIcon}
      />
    </Form.Item>
  );
};

export default Base64UrlInput; 