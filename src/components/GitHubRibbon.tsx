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
      <div className="github-fork-ribbon" data-ribbon={text}>
        <a 
          href={repositoryUrl} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {text}
        </a>
      </div>
    </div>
  );
};

export default GitHubRibbon; 