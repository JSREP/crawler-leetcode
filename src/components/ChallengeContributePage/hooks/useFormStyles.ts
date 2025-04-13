import { useEffect } from 'react';

/**
 * 自定义Hook：应用表单样式
 * 为表单添加全局CSS样式
 */
export const useFormStyles = () => {
  useEffect(() => {
    // 添加表单全局样式
    const style = document.createElement('style');
    style.innerHTML = `
      .ant-form-item-label > label {
        font-weight: 500;
      }
      
      .form-section {
        margin-bottom: 24px;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      .form-section-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #222;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 12px;
      }
      
      .form-section-subtitle {
        font-size: 14px;
        color: #666;
        margin-bottom: 16px;
      }
      
      .form-footer {
        padding: 16px 0;
        margin-top: 20px;
        text-align: center;
      }
      
      .required-field::after {
        content: '*';
        color: #ff4d4f;
        margin-left: 4px;
      }
    `;
    
    document.head.appendChild(style);
    
    // 清理函数
    return () => {
      document.head.removeChild(style);
    };
  }, []);
};

export default useFormStyles; 