import { useEffect, useState } from 'react';
import { challenges } from '../ChallengeListPage/exports';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import ChallengeSection from './ChallengeSection';
import { pageContainerStyle, animationStyles } from './styles';
import { useMediaQuery } from 'react-responsive';

// 获取不同难度的挑战数量
const getDifficultyCounts = () => {
  const counts = { easy: 0, medium: 0, hard: 0 };
  challenges.forEach(challenge => {
    // 匹配新的难度分类:
    // easy: 1星, medium: 2-3星, hard: 4-5星
    if (challenge.difficulty === 1) counts.easy++;
    else if (challenge.difficulty === 2 || challenge.difficulty === 3) counts.medium++;
    else if (challenge.difficulty >= 4) counts.hard++;
  });
  return counts;
};

/**
 * 首页组件
 * 展示网站主要功能和推荐挑战列表
 */
const HomePage = () => {
  const [animatedStats, setAnimatedStats] = useState(false);
  const navigate = useNavigate();
  const difficultyCounts = getDifficultyCounts();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // 获取最新的3个挑战
  const recentChallenges = [...challenges]
    .sort((a, b) => b.createTime.getTime() - a.createTime.getTime())
    .slice(0, 3);
    
  // 随机获取3个热门挑战
  const popularChallenges = [...challenges]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
    
  // 首页列表分页设置
  const [homePagination] = useState({ current: 1, pageSize: 3 });
  
  // 组件挂载后触发数据统计动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 处理分页变化 (这里实际不会使用，但需要传递以满足类型要求)
  const handlePaginationChange = () => {};
  
  // 处理标签点击
  const handleTagClick = (tag: string) => {
    navigate(`/challenges?tags=${tag}`);
  };
  
  // 处理难度点击
  const handleDifficultyClick = (difficulty: string) => {
    navigate(`/challenges?difficulty=${difficulty}`);
  };
  
  // 处理平台点击
  const handlePlatformClick = (platform: string) => {
    navigate(`/challenges?platform=${platform}`);
  };

  return (
    <div style={pageContainerStyle} className={isMobile ? 'mobile-container' : ''}>
      {/* 英雄区域 */}
      <HeroSection 
        challenges={challenges.length}
        difficultyCounts={difficultyCounts}
        animatedStats={animatedStats}
      />
      
      {/* 功能介绍 */}
      <FeatureSection />
      
      {/* 挑战列表区域 */}
      <ChallengeSection 
        recentChallenges={recentChallenges}
        popularChallenges={popularChallenges}
        homePagination={homePagination}
        onPaginationChange={handlePaginationChange}
        onTagClick={handleTagClick}
        onDifficultyClick={handleDifficultyClick}
        onPlatformClick={handlePlatformClick}
      />
      
      {/* 添加CSS动画 */}
      <style>{animationStyles}</style>
    </div>
  );
};

export default HomePage; 