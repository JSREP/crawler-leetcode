import * as React from 'react';
import { FormInstance } from 'antd';
import Base64UrlInput from './Base64UrlInput';

interface UrlInputProps {
  form: FormInstance;
  onChange?: (value: string) => void;
}

/**
 * URL输入组件
 * 包装Base64UrlInput，提供URL输入和编码功能
 */
const UrlInput: React.FC<UrlInputProps> = ({ form, onChange }) => {
  return (
    <Base64UrlInput 
      form={form} 
      onChange={onChange}
    />
  );
};

export default UrlInput; 