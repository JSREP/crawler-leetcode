import { FC, useEffect } from 'react';
import { List, Pagination } from 'antd';
import { Challenge } from '../../types/challenge';
import ChallengeListItem from './ChallengeListItem';

const PAGE_SIZE_KEY = 'challenge-list-page-size';

interface SimpleChallengeListProps {
  challenges: Challenge[];
  selectedTags: string[];
  pagination: {
    current: number;
    pageSize: number;
  };
  total: number;
  onPaginationChange: (page: number, pageSize: number) => void;
  onTagClick: (tag: string) => void;
  onDifficultyClick: (difficulty: string) => void;
  onPlatformClick: (platform: string) => void;
  onChallengeClick: (id: string) => void;
}

const SimpleChallengeList: FC<SimpleChallengeListProps> = ({
  challenges,
  selectedTags,
  pagination,
  total,
  onPaginationChange,
  onTagClick,
  onDifficultyClick,
  onPlatformClick,
  onChallengeClick
}) => {
  // 从本地存储加载上次使用的分页大小
  useEffect(() => {
    const savedPageSize = localStorage.getItem(PAGE_SIZE_KEY);
    if (savedPageSize && pagination && parseInt(savedPageSize) !== pagination.pageSize) {
      onPaginationChange(1, parseInt(savedPageSize));
    }
  }, [pagination, onPaginationChange]);

  // 处理分页变化
  const handlePaginationChange = (page: number, pageSize: number) => {
    // 保存分页大小到本地存储
    localStorage.setItem(PAGE_SIZE_KEY, pageSize.toString());
    onPaginationChange(page, pageSize);
  };

  // 确保pagination存在且有效
  if (!pagination) {
    return null;
  }

  return (
    <>
      {/* 挑战列表 */}
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={challenges}
        renderItem={(challenge: Challenge) => (
          <List.Item>
            <ChallengeListItem
              challenge={challenge}
              selectedTags={selectedTags}
              onClick={() => onChallengeClick(challenge.idAlias || challenge.id.toString())}
              onTagClick={onTagClick}
              onDifficultyClick={(difficulty) => onDifficultyClick(String(difficulty))}
              onPlatformClick={(platform) => onPlatformClick(platform)}
            />
          </List.Item>
        )}
      />

      {/* 分页 */}
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={total}
        showSizeChanger
        onChange={handlePaginationChange}
        style={{ marginTop: 24, textAlign: 'center' }}
      />
    </>
  );
};

export default SimpleChallengeList; 