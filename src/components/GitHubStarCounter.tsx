import { useState, useEffect } from 'react';
import { GithubOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip, Spin } from 'antd';

interface GitHubStarCounterProps {
  owner: string;
  repo: string;
  cacheTime?: number; // 缓存时间，单位：毫秒，默认30分钟
}

const CACHE_KEY = 'github-stars-cache';

interface StarCache {
  count: number;
  timestamp: number;
  owner: string;
  repo: string;
}

/**
 * GitHub Star计数器组件
 * 显示项目的star数，并支持缓存
 */
const GitHubStarCounter: React.FC<GitHubStarCounterProps> = ({ 
  owner, 
  repo, 
  cacheTime = 30 * 60 * 1000 // 默认30分钟
}) => {
  const [starCount, setStarCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        // 尝试从缓存中获取
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const cache: StarCache = JSON.parse(cachedData);
          
          // 检查是否是同一仓库的缓存
          if (cache.owner === owner && cache.repo === repo) {
            // 检查缓存是否过期
            const now = Date.now();
            if (now - cache.timestamp < cacheTime) {
              setStarCount(cache.count);
              setLoading(false);
              return;
            }
          }
        }

        // 缓存不存在或已过期，发起请求
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch repo data');
        }
        
        const data = await response.json();
        const count = data.stargazers_count;
        
        // 更新缓存
        const cacheData: StarCache = {
          count,
          timestamp: Date.now(),
          owner,
          repo
        };
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        setStarCount(count);
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
        // 如果请求失败但有缓存，使用缓存数据，不管是否过期
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const cache: StarCache = JSON.parse(cachedData);
          if (cache.owner === owner && cache.repo === repo) {
            setStarCount(cache.count);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStarCount();
  }, [owner, repo, cacheTime]);

  // 格式化星星数量，大于1000显示为1k+的形式
  const formatStarCount = (count: number): string => {
    if (count >= 1000) {
      const formattedCount = (count / 1000).toFixed(1);
      // 如果小数点后是0，则不显示小数点
      return formattedCount.endsWith('.0') 
        ? `${formattedCount.slice(0, -2)}k` 
        : `${formattedCount}k`;
    }
    return count.toString();
  };

  // 精美的按钮容器
  const buttonStyles = {
    display: 'flex',
    alignItems: 'center',
    height: '28px',
    padding: '0 12px',
    background: isHovered 
      ? 'linear-gradient(135deg, #2b3137 0%, #373e47 100%)' 
      : 'linear-gradient(135deg, #24292e 0%, #2c3036 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.2px',
    transition: 'all 0.2s ease',
    boxShadow: isHovered 
      ? '0 4px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)' 
      : '0 2px 5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transform: isHovered ? 'translateY(-1px)' : 'none',
    textDecoration: 'none'
  };

  // GitHub 图标样式
  const githubIconStyles = {
    fontSize: '14px',
    marginRight: '4px',
    color: 'white',
    transition: 'transform 0.2s ease',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
  };

  // 星星图标样式
  const starIconStyles = {
    color: isHovered ? '#ffdd57' : '#f9d361',
    fontSize: '12px',
    marginRight: '5px',
    marginLeft: '3px',
    transition: 'transform 0.3s ease, color 0.3s ease',
    transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
    filter: isHovered 
      ? 'drop-shadow(0 0 3px rgba(255, 221, 87, 0.6))' 
      : 'drop-shadow(0 0 1px rgba(255, 221, 87, 0.3))',
  };

  // 数字样式
  const countStyles = {
    fontWeight: 600,
    color: 'white',
    fontSize: '12px',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  };

  // 加载动画容器样式
  const loadingContainerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '4px',
    width: '20px',
    height: '16px',
  };

  // 发光动画样式
  const glowStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
    transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  } as React.CSSProperties;

  // 按钮文本内容
  const buttonText = loading ? (
    <div style={loadingContainerStyles}>
      <Spin size="small" style={{ transform: 'scale(0.7)' }} />
    </div>
  ) : (
    <span style={countStyles}>
      {starCount !== null ? formatStarCount(starCount) : '0'}
    </span>
  );

  return (
    <Tooltip 
      title="Star us on GitHub!" 
      placement="bottom"
      color="#1a1e22"
      overlayInnerStyle={{
        padding: '8px 10px',
        fontSize: '12px',
        fontWeight: 500,
        borderRadius: '6px'
      }}
    >
      <a
        href={`https://github.com/${owner}/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyles as React.CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={glowStyles} />
        <GithubOutlined style={githubIconStyles} />
        <StarFilled style={starIconStyles} />
        {buttonText}
      </a>
    </Tooltip>
  );
};

export default GitHubStarCounter; 