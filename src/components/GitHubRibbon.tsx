import * as React from 'react';

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
 */
const GitHubRibbon: React.FC<GitHubRibbonProps> = ({
  repositoryUrl,
  text = 'Fork me on GitHub',
  position = 'right'
}) => {
  return (
    <div className={`github-fork-ribbon-wrapper ${position}`}>
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