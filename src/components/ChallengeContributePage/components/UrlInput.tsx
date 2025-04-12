import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Input, message, FormInstance } from 'antd';

interface UrlInputProps {
  form: FormInstance;
  encodeUrl: (url: string) => string;
  decodeUrl: (base64: string) => string;
}

/**
 * URL输入组件，会自动处理Base64编码/解码
 */
const UrlInput: React.FC<UrlInputProps> = ({ form, encodeUrl, decodeUrl }) => {
  const [decodedUrl, setDecodedUrl] = useState<string>('');
  const [isUrlFocused, setIsUrlFocused] = useState<boolean>(false);

  // 监听表单值变化，处理base64Url的解码
  useEffect(() => {
    // 获取当前表单中的base64Url值
    const currentBase64Url = form.getFieldValue('base64Url');
    
    // 如果有值且decodedUrl为空，则进行解码
    if (currentBase64Url && !decodedUrl) {
      try {
        setDecodedUrl(decodeUrl(currentBase64Url));
      } catch (e) {
        // 如果解码失败，可能本身就是明文URL
        setDecodedUrl(currentBase64Url);
      }
    }
  }, [form, decodedUrl, decodeUrl]);

  // 监听base64-url-updated事件，用于YAML导入时更新URL
  useEffect(() => {
    const handleBase64UrlUpdate = (event: any) => {
      if (event.detail && event.detail.base64Url) {
        const base64 = event.detail.base64Url;
        // 检查是否是有效字符串
        if (typeof base64 !== 'string') {
          console.error('接收到的base64Url不是字符串类型:', base64);
          return;
        }
        
        console.log('接收到base64Url更新事件:', base64);
        
        try {
          // 尝试解码
          const decoded = decodeUrl(base64);
          setDecodedUrl(decoded);
          
          // 如果当前不在编辑状态，则更新表单值为base64
          if (!isUrlFocused) {
            form.setFieldsValue({ base64Url: base64 });
          }
          
          console.log('解码导入的base64Url:', base64, ' -> ', decoded);
        } catch (error) {
          console.error('解码导入的base64Url失败:', error);
          // 如果解码失败但base64是有效字符串，仍然更新表单
          if (base64 && typeof base64 === 'string') {
            form.setFieldsValue({ base64Url: base64 });
          }
        }
      }
    };

    window.addEventListener('base64-url-updated', handleBase64UrlUpdate);

    return () => {
      window.removeEventListener('base64-url-updated', handleBase64UrlUpdate);
    };
  }, [form, decodeUrl, isUrlFocused]);

  // URL输入框获得焦点时解码
  const handleUrlFocus = () => {
    setIsUrlFocused(true);
    const base64Url = form.getFieldValue('base64Url');
    if (base64Url) {
      try {
        const decoded = decodeUrl(base64Url);
        setDecodedUrl(decoded);
        // 临时将表单值设为解码后的明文，供编辑
        form.setFieldValue('base64Url', decoded);
      } catch (e) {
        // 如果解码失败，可能本身就是明文URL
        setDecodedUrl(base64Url);
      }
    }
  };

  // URL输入框失去焦点时编码
  const handleUrlBlur = () => {
    setIsUrlFocused(false);
    // 获取当前输入框的值（应该是明文URL）
    const url = form.getFieldValue('base64Url');
    if (url) {
      // 对可能的明文URL进行编码
      try {
        const encoded = encodeUrl(url);
        // 设置回编码后的值
        form.setFieldValue('base64Url', encoded);
        // 短暂提示
        message.success('URL已自动转换为Base64格式', 1);
      } catch (e) {
        console.error('URL编码失败:', e);
      }
    }
  };

  return (
    <Form.Item
      name="base64Url"
      label="目标网站URL"
      tooltip="输入普通URL，系统会自动进行Base64编码。输入框获得焦点时会显示明文，失去焦点时会显示Base64编码值。"
      rules={[{ required: true, message: '请输入目标网站URL' }]}
    >
      <Input 
        placeholder="输入普通URL，如 https://example.com"
        onFocus={handleUrlFocus}
        onBlur={handleUrlBlur}
      />
    </Form.Item>
  );
};

export default UrlInput; 