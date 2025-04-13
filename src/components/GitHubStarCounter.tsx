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

  // 美化后的容器样式
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#24292e',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '28px',
    borderRadius: '15px',
    textDecoration: 'none',
    padding: '0 12px',
    fontWeight: 500,
    border: '1px solid rgba(36, 41, 46, 0.1)',
    background: 'linear-gradient(to bottom, #fafbfc, #f6f8fa)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  // 悬停样式
  const hoverStyle = {
    background: 'linear-gradient(to bottom, #f6f8fa, #e1e4e8)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-1px)',
    borderColor: 'rgba(36, 41, 46, 0.2)',
  };

  // GitHub图标样式
  const githubIconStyle = {
    fontSize: '16px',
    color: '#24292e',
    marginRight: '4px',
  };

  // Star图标样式
  const starIconStyle = {
    fontSize: '14px',
    color: '#f1c40f',
    marginRight: '4px',
    filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1))',
  };

  // 数字样式
  const countStyle = {
    fontWeight: 600,
    color: '#24292e',
  };

  // 加载动画样式
  const spinnerStyle = {
    margin: '0 5px',
  };

  return (
    <Tooltip title="Star us on GitHub" placement="bottom">
      <a 
        href={`https://github.com/${owner}/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        style={containerStyle}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, hoverStyle);
        }}
        onMouseOut={(e) => {
          // 重置为原始样式
          Object.assign(e.currentTarget.style, containerStyle);
        }}
      >
        <GithubOutlined style={githubIconStyle} />
        <StarFilled style={starIconStyle} />
        {loading ? (
          <Spin size="small" style={spinnerStyle} />
        ) : (
          <span style={countStyle}>
            {starCount !== null ? formatStarCount(starCount) : '0'}
          </span>
        )}
      </a>
    </Tooltip>
  );
};

export default GitHubStarCounter; 