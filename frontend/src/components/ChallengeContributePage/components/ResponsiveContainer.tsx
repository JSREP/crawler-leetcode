import * as React from 'react';
import { useEffect, useState } from 'react';
import { styles } from '../styles';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  mobileBreakpoint?: number;
}

/**
 * 响应式容器组件
 * 根据屏幕尺寸自动调整布局样式
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  mobileBreakpoint = 768 // 默认移动端断点为768px
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // 监听窗口尺寸变化
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };
    
    // 初始检查
    checkScreenSize();
    
    // 添加resize事件监听
    window.addEventListener('resize', checkScreenSize);
    
    // 清理
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [mobileBreakpoint]);
  
  // 根据屏幕尺寸选择样式
  const containerStyle = isMobile 
    ? { ...styles.container, ...styles.mobileContainer } 
    : styles.container;
  
  return (
    <div style={containerStyle} className={isMobile ? 'mobile-view' : 'desktop-view'}>
      {children}
    </div>
  );
};

export default ResponsiveContainer; 