import { useState, useEffect } from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

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

  // 样式
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    fontSize: '14px',
    padding: '4px 8px',
    border: '1px solid #e1e4e8',
    borderRadius: '6px',
    color: '#24292e',
    backgroundColor: '#f6f8fa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '28px',
    lineHeight: '20px'
  };

  // 当鼠标悬停时的样式
  const hoverStyle = {
    backgroundColor: '#e1e4e8'
  };

  return (
    <Tooltip title="Star us on GitHub">
      <a 
        href={`https://github.com/${owner}/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        style={containerStyle}
        onMouseOver={(e) => {
          Object.assign(e.currentTarget.style, hoverStyle);
        }}
        onMouseOut={(e) => {
          Object.assign(e.currentTarget.style, containerStyle);
        }}
      >
        <GithubOutlined style={{ marginRight: '6px' }} />
        {loading ? '...' : `${starCount || 0}`}
      </a>
    </Tooltip>
  );
};

export default GitHubStarCounter; 