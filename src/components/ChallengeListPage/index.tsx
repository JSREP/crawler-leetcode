import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { List, Pagination, Space } from 'antd';
import { Challenge } from '../../types/challenge';
import { challenges } from './ChallengeData';
import ChallengeFilters from './ChallengeFilters';
import ChallengeControls from './ChallengeControls';
import ChallengeListItem from './ChallengeListItem';

/**
 * 挑战列表页面组件
 * 展示所有挑战，支持过滤、排序和搜索
 */
const ChallengeListPage = () => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tags: [] as string[],
    });
    const [sortBy, setSortBy] = useState('number');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 处理标签点击
    const handleTagClick = (clickedTag: string) => {
        const currentSearchParams = new URLSearchParams(searchParams);
        const currentTags = currentSearchParams.getAll('tags');
        const newTags = currentTags.includes(clickedTag)
            ? currentTags.filter(t => t !== clickedTag)
            : [...currentTags, clickedTag];

        currentSearchParams.delete('tags');
        newTags.forEach(tag => currentSearchParams.append('tags', tag));
        navigate(`/challenges?${currentSearchParams.toString()}`);
    };

    // 处理难度点击
    const handleDifficultyClick = (difficulty: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('difficulty', difficulty);
        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    // 从URL同步过滤器状态
    useEffect(() => {
        const tags = searchParams.getAll('tags');
        const difficulty = searchParams.get('difficulty') || 'all';
        setFilters(prev => ({ ...prev, tags, difficulty }));
    }, [searchParams]);

    // 获取所有可用标签
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        challenges.forEach((challenge: Challenge) => challenge.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, []);

    // 过滤和排序挑战
    const filteredChallenges = useMemo(() => {
        return challenges
            .filter((challenge: Challenge) => {
                const matchesSearch = [challenge.title, challenge.description]
                    .some(text => text.toLowerCase().includes(searchQuery.toLowerCase()));

                const matchesDifficulty = filters.difficulty === 'all' ||
                    challenge.difficulty === parseInt(filters.difficulty);

                const matchesTags = filters.tags.length === 0 ||
                    filters.tags.every(tag => challenge.tags.includes(tag));

                return matchesSearch && matchesDifficulty && matchesTags;
            })
            .sort((a: Challenge, b: Challenge) => {
                const orderModifier = sortOrder === 'asc' ? 1 : -1;
                switch (sortBy) {
                    case 'number':
                        return (a.number - b.number) * orderModifier;
                    case 'difficulty':
                        return (a.difficulty - b.difficulty) * orderModifier;
                    case 'createTime':
                        return (a.createTime.getTime() - b.createTime.getTime()) * orderModifier;
                    case 'updateTime':
                        return (a.updateTime.getTime() - b.updateTime.getTime()) * orderModifier;
                    default:
                        return 0;
                }
            });
    }, [filters, searchQuery, sortBy, sortOrder]);

    // 分页数据
    const paginatedData = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        return filteredChallenges.slice(start, start + pagination.pageSize);
    }, [filteredChallenges, pagination]);

    // 移除过滤器
    const handleFilterRemove = (type: 'tag' | 'difficulty', value?: string) => {
        const newSearchParams = new URLSearchParams(searchParams);

        if (type === 'tag' && value) {
            const newTags = filters.tags.filter(t => t !== value);
            newSearchParams.delete('tags');
            newTags.forEach(t => newSearchParams.append('tags', t));
        } else if (type === 'difficulty') {
            newSearchParams.delete('difficulty');
        }

        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    // 清空所有过滤器
    const handleClearAllFilters = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        newSearchParams.delete('difficulty');
        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    // 多标签选择变更
    const handleTagsChange = (tags: string[]) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        tags.forEach(tag => newSearchParams.append('tags', tag));
        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    return (
        <div style={{
            padding: 24,
            maxWidth: '60%',
            margin: '0 auto',
            transition: 'all 0.3s ease'
        }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                {/* 已应用的过滤器标签 */}
                <ChallengeFilters
                    selectedTags={filters.tags}
                    selectedDifficulty={filters.difficulty}
                    hasFilters={filters.tags.length > 0 || filters.difficulty !== 'all'}
                    onRemoveTag={(tag) => handleFilterRemove('tag', tag)}
                    onRemoveDifficulty={() => handleFilterRemove('difficulty')}
                    onClearAll={handleClearAllFilters}
                />

                {/* 搜索和控制项 */}
                <ChallengeControls
                    allTags={allTags}
                    selectedTags={filters.tags}
                    selectedDifficulty={filters.difficulty}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onTagsChange={handleTagsChange}
                    onDifficultyChange={handleDifficultyClick}
                    onSortByChange={setSortBy}
                    onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    onSearch={setSearchQuery}
                />

                {/* 挑战列表 */}
                <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={paginatedData}
                    renderItem={(challenge: Challenge) => (
                        <List.Item>
                            <ChallengeListItem
                                challenge={challenge}
                                selectedTags={filters.tags}
                                onClick={() => navigate(`/challenge/${challenge.id}`)}
                                onTagClick={handleTagClick}
                                onDifficultyClick={(difficulty) => handleDifficultyClick(String(difficulty))}
                            />
                        </List.Item>
                    )}
                />

                {/* 分页 */}
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={filteredChallenges.length}
                    showSizeChanger
                    onChange={(page, pageSize) => setPagination({ current: page, pageSize: pageSize || 10 })}
                    style={{ marginTop: 24, textAlign: 'center' }}
                />
            </Space>
        </div>
    );
};

export default ChallengeListPage; 