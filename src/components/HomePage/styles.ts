import { CSSProperties } from 'react';

// 页面容器样式
export const pageContainerStyle: CSSProperties = {
  padding: '0',
  overflow: 'hidden'
};

// 英雄区域样式
export const heroSectionStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #1a365d 0%, #153e75 50%, #2a4365 100%)',
  padding: '60px 24px',
  color: 'white',
  borderRadius: '0 0 50px 50px',
  marginBottom: '40px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};

// 移动端英雄区域样式
export const heroSectionMobileStyle: CSSProperties = {
  padding: '40px 16px',
  borderRadius: '0 0 30px 30px',
  marginBottom: '30px',
};

// 标题样式
export const heroTitleStyle: CSSProperties = {
  color: 'white',
  fontSize: '2.5rem',
  marginBottom: '16px'
};

// 移动端标题样式
export const heroTitleMobileStyle: CSSProperties = {
  fontSize: '2rem',
  marginBottom: '12px'
};

// 副标题样式
export const heroSubtitleStyle: CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: '1.1rem',
  marginBottom: '24px'
};

// 移动端副标题样式
export const heroSubtitleMobileStyle: CSSProperties = {
  fontSize: '1rem',
  marginBottom: '20px'
};

// 主按钮样式
export const primaryButtonStyle: CSSProperties = {
  background: '#42b983',
  borderColor: '#42b983',
  height: '46px',
  borderRadius: '23px',
  padding: '0 28px'
};

// 移动端主按钮样式
export const primaryButtonMobileStyle: CSSProperties = {
  height: '40px',
  padding: '0 20px',
  fontSize: '14px'
};

// 次要按钮样式
export const secondaryButtonStyle: CSSProperties = {
  borderColor: 'rgba(255,255,255,0.5)',
  color: 'white',
  height: '46px',
  borderRadius: '23px',
  padding: '0 28px',
  background: 'rgba(255,255,255,0.15)',
  fontWeight: 500,
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};

// 移动端次要按钮样式
export const secondaryButtonMobileStyle: CSSProperties = {
  height: '40px',
  padding: '0 20px',
  fontSize: '14px'
};

// 统计卡片样式
export const statsCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '20px',
  padding: '30px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

// 移动端统计卡片样式
export const statsCardMobileStyle: CSSProperties = {
  padding: '20px',
  borderRadius: '16px',
  marginTop: '20px'
};

// 特性部分容器样式
export const featureSectionStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto 48px',
  padding: '0 24px'
};

// 移动端特性部分容器样式
export const featureSectionMobileStyle: CSSProperties = {
  padding: '0 16px',
  margin: '0 auto 36px'
};

// 标题样式
export const sectionTitleStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: '48px'
};

// 移动端标题样式
export const sectionTitleMobileStyle: CSSProperties = {
  marginBottom: '36px',
  fontSize: '1.5rem'
};

// 标题下方的装饰线样式
export const sectionTitleDividerStyle: CSSProperties = {
  height: '4px',
  width: '80px',
  background: 'linear-gradient(to right, #42b983, #1890ff)',
  margin: '16px auto 0'
};

// 特性卡片样式
export const featureCardStyle: CSSProperties = {
  height: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  border: 'none',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
};

// 特性卡片内容样式
export const featureCardContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
};

// 挑战部分容器样式
export const challengeSectionStyle: CSSProperties = {
  background: '#f8fbff',
  padding: '48px 24px',
  borderRadius: '40px 40px 0 0'
};

// 移动端挑战部分容器样式
export const challengeSectionMobileStyle: CSSProperties = {
  padding: '36px 16px',
  borderRadius: '30px 30px 0 0'
};

// 挑战内容容器样式
export const challengeContainerStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto'
};

// 挑战列表标题容器样式
export const challengeTitleContainerStyle: CSSProperties = {
  marginBottom: '32px'
};

// 移动端挑战列表标题容器样式
export const challengeTitleMobileStyle: CSSProperties = {
  marginBottom: '24px'
};

// 查看更多按钮容器样式
export const viewMoreButtonContainerStyle: CSSProperties = {
  textAlign: 'center',
  marginTop: '24px'
};

// 查看更多按钮样式
export const viewMoreButtonStyle: CSSProperties = {
  borderRadius: '20px'
};

// 移动端查看更多按钮样式
export const viewMoreButtonMobileStyle: CSSProperties = {
  marginBottom: '30px'
};

// CSS 动画样式
export const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .ant-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .ant-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  }

  /* 响应式布局媒体查询 */
  @media screen and (max-width: 768px) {
    .hero-title {
      font-size: 2rem !important;
      margin-bottom: 12px !important;
    }
    
    .hero-subtitle {
      font-size: 1rem !important;
      margin-bottom: 20px !important;
    }
    
    .hero-buttons button {
      height: 40px !important;
      padding: 0 20px !important;
      font-size: 14px !important;
    }
    
    .stats-card {
      margin-top: 20px !important;
      padding: 20px !important;
    }
    
    .feature-title {
      font-size: 1.5rem !important;
    }
    
    .challenge-section-title h3 {
      font-size: 1.3rem !important;
    }
    
    .challenge-more-button {
      margin-bottom: 30px !important;
    }
  }
`; 