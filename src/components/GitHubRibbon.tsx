import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

interface GitHubRibbonProps {
  /**
   * GitHub仓库的URL地址
   */
  repositoryUrl: string;
  
  /**
   * 显示在徽标上的文本
   */
  text?: string;
  
  /**
   * 徽标的位置，默认为右上角
   */
  position?: 'right' | 'right-bottom' | 'left-top' | 'left-bottom';
}

/**
 * GitHub Ribbon组件
 * 显示"Fork me on GitHub"的角标
 * 在移动端下完全隐藏
 */
const GitHubRibbon: React.FC<GitHubRibbonProps> = ({
  repositoryUrl,
  text = 'Fork me on GitHub',
  position = 'right'
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // 如果是移动设备，不显示GitHub角标
  if (isMobile) {
    return null;
  }

  // 根据position确定位置样式
  const getPositionStyle = () => {
    switch(position) {
      case 'right':
        return { top: 0, right: 0 };
      case 'right-bottom':
        return { bottom: 0, right: 0 };
      case 'left-top':
        return { top: 0, left: 0 };
      case 'left-bottom':
        return { bottom: 0, left: 0 };
      default:
        return { top: 0, right: 0 };
    }
  };

  return (
    <div 
      className={`github-fork-ribbon-wrapper ${position}`}
      style={{
        position: 'fixed',
        zIndex: 9999,
        ...getPositionStyle()
      }}
    >
      <div 
        className="github-fork-ribbon" 
        data-ribbon={text}
        style={{ 
          cursor: 'pointer',
          pointerEvents: 'auto' // 覆盖CSS中的pointer-events: none
        }}
      >
        <a 
          href={repositoryUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: '100%', 
            textDecoration: 'none',
            zIndex: 9999,
            pointerEvents: 'auto' // 确保链接可点击
          }}
          onClick={(e) => {
            // 防止事件冒泡，确保链接被点击
            e.stopPropagation();
          }}
        >
          {text}
        </a>
      </div>
    </div>
  );
};

export default GitHubRibbon; 