import { CSSProperties } from 'react';

// 页面容器样式
export const containerStyle: CSSProperties = {
  padding: 24, 
  background: '#f8f9fa', 
  minHeight: '100vh'
};

// 标题和分割线样式
export const titleStyle: CSSProperties = {
  textAlign: 'center', 
  marginBottom: 48
};

// 标题下方的装饰线样式
export const titleDividerStyle: CSSProperties = {
  height: 4,
  background: 'linear-gradient(to right, #42b983, #3eaf7c)',
  width: 100,
  margin: '10px auto 0'
};

// 内容区域样式
export const contentStyle: CSSProperties = {
  maxWidth: 1000, 
  margin: '0 auto'
};

// 卡片公共样式
export const cardStyle: CSSProperties = {
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
  transition: 'all 0.3s',
  marginBottom: 32
};

// 卡片文本样式
export const textStyle: CSSProperties = {
  color: '#4a5568', 
  lineHeight: 1.8,
  fontSize: '16px',
  display: 'block'
};

// GitHub图标样式
export const githubIconStyle: CSSProperties = {
  color: '#4a5568', 
  fontSize: '18px'
};

// GitHub链接样式
export const githubLinkStyle: CSSProperties = {
  color: '#42b983', 
  fontSize: '16px'
};

// Star标签样式
export const starTagStyle: CSSProperties = {
  background: '#42b983',
  color: '#fff',
  borderRadius: 20,
  marginLeft: 8
}; 