import { useState, useEffect } from 'react';
import { GithubOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip, Badge } from 'antd';

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

  // 容器样式
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#333',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, color 0.2s ease',
    height: '100%',
    borderRadius: '4px',
    textDecoration: 'none',
    padding: '0 8px',
    fontWeight: 600,
  };

  // GitHub图标样式
  const githubIconStyle = {
    fontSize: '22px',
    color: '#24292e',
    marginRight: '2px',
    verticalAlign: 'middle'
  };

  // Star图标样式
  const starIconStyle = {
    fontSize: '14px',
    color: '#ff9800',
    marginRight: '3px',
  };

  // 徽章样式
  const badgeStyle = {
    backgroundColor: '#24292e',
    color: 'white',
    fontSize: '12px',
    padding: '1px 6px',
    borderRadius: '10px',
    fontWeight: 'bold',
    marginLeft: '4px',
    display: 'inline-block',
  };

  return (
    <Tooltip title="Star us on GitHub" placement="bottom">
      <a 
        href={`https://github.com/${owner}/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        style={containerStyle}
        onMouseOver={(e) => {
          e.currentTarget.style.color = '#1890ff';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = '#333';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <GithubOutlined style={githubIconStyle} />
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
          <StarFilled style={starIconStyle} />
          <span>{loading ? '...' : starCount}</span>
        </div>
      </a>
    </Tooltip>
  );
};

export default GitHubStarCounter; 