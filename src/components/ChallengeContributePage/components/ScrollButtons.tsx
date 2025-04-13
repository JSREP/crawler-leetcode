import * as React from 'react';
import { Button, Tooltip } from 'antd';
import { VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';

/**
 * 滚动控制按钮组件，用于快速跳转到页面顶部或底部
 */
const ScrollButtons: React.FC = () => {
  // 滚动到页面顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 滚动到页面底部
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  // 按钮样式
  const buttonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    border: 'none'
  };

  return (
    <div style={{ 
      position: 'fixed', 
      right: '24px', 
      bottom: '80px', 
      zIndex: 9999, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px' 
    }}>
      <Tooltip title="回到顶部" placement="left">
        <Button
          icon={<VerticalAlignTopOutlined />}
          onClick={scrollToTop}
          style={buttonStyle}
          type="primary"
          shape="circle"
        />
      </Tooltip>
      <Tooltip title="前往底部" placement="left">
        <Button
          icon={<VerticalAlignBottomOutlined />}
          onClick={scrollToBottom}
          style={buttonStyle}
          type="primary"
          shape="circle"
        />
      </Tooltip>
    </div>
  );
};

export default ScrollButtons; 