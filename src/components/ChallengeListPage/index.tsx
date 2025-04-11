import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Space } from 'antd';
import { Challenge } from '../../types/challenge';
import { challenges } from './ChallengeData';
import ChallengeFilters from './ChallengeFilters';
import ChallengeControls from './ChallengeControls';
import SimpleChallengeList from './SimpleChallengeList';

/**
 * 挑战列表页面组件
 * 展示所有挑战，支持过滤、排序和搜索
 */
const ChallengeListPage = () => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tags: [] as string[],
        platform: 'all'
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

    // 处理平台筛选
    const handlePlatformChange = (platform: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('platform', platform);
        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    // 从URL同步过滤器状态
    useEffect(() => {
        const tags = searchParams.getAll('tags');
        const difficulty = searchParams.get('difficulty') || 'all';
        const platform = searchParams.get('platform') || 'all';
        setFilters(prev => ({ ...prev, tags, difficulty, platform }));
    }, [searchParams]);

    // 获取所有可用标签
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        challenges.forEach((challenge: Challenge) => challenge.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, []);

    // 获取所有可用平台
    const allPlatforms = useMemo(() => {
        const platforms = new Set<string>();
        challenges.forEach((challenge: Challenge) => {
            if (challenge.platform) {
                platforms.add(challenge.platform);
            }
        });
        return Array.from(platforms);
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
                    
                const matchesPlatform = filters.platform === 'all' ||
                    challenge.platform === filters.platform;

                return matchesSearch && matchesDifficulty && matchesTags && matchesPlatform;
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

    // 处理分页变化
    const handlePaginationChange = (page: number, pageSize: number) => {
        setPagination({ current: page, pageSize });
    };

    // 移除过滤器
    const handleFilterRemove = (type: 'tag' | 'difficulty' | 'platform', value?: string) => {
        const newSearchParams = new URLSearchParams(searchParams);

        if (type === 'tag' && value) {
            const newTags = filters.tags.filter(t => t !== value);
            newSearchParams.delete('tags');
            newTags.forEach(t => newSearchParams.append('tags', t));
        } else if (type === 'difficulty') {
            newSearchParams.delete('difficulty');
        } else if (type === 'platform') {
            newSearchParams.delete('platform');
        }

        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    // 清空所有过滤器
    const handleClearAllFilters = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        newSearchParams.delete('difficulty');
        newSearchParams.delete('platform');
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
                    selectedPlatform={filters.platform}
                    hasFilters={filters.tags.length > 0 || filters.difficulty !== 'all' || filters.platform !== 'all'}
                    onRemoveTag={(tag) => handleFilterRemove('tag', tag)}
                    onRemoveDifficulty={() => handleFilterRemove('difficulty')}
                    onRemovePlatform={() => handleFilterRemove('platform')}
                    onClearAll={handleClearAllFilters}
                />

                {/* 搜索和控制项 */}
                <ChallengeControls
                    allTags={allTags}
                    allPlatforms={allPlatforms}
                    selectedTags={filters.tags}
                    selectedDifficulty={filters.difficulty}
                    selectedPlatform={filters.platform}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onTagsChange={handleTagsChange}
                    onDifficultyChange={handleDifficultyClick}
                    onPlatformChange={handlePlatformChange}
                    onSortByChange={setSortBy}
                    onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    onSearch={setSearchQuery}
                />

                {/* 挑战列表和分页 */}
                <SimpleChallengeList 
                    challenges={paginatedData}
                    selectedTags={filters.tags}
                    pagination={pagination}
                    onPaginationChange={handlePaginationChange}
                    onTagClick={handleTagClick}
                    onDifficultyClick={handleDifficultyClick}
                    onPlatformClick={handlePlatformChange}
                    onChallengeClick={(id) => navigate(`/challenge/${id}`)}
                    total={filteredChallenges.length}
                />
            </Space>
        </div>
    );
};

export default ChallengeListPage; 