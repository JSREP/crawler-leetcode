import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Space } from 'antd';
import { Challenge } from '../../types/challenge';
import { challenges } from './ChallengeData';
import ChallengeFilters from './ChallengeFilters';
import ChallengeControls from './ChallengeControls';
import SimpleChallengeList from './SimpleChallengeList';
import { searchService } from '../../services/SearchService';

// 本地存储键
const FILTER_STORAGE_KEY = 'challenge-filter-preferences';
const SORT_STORAGE_KEY = 'challenge-sort-preferences';

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
    const [sortBy, setSortBy] = useState('updateTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 初始化搜索服务
    useEffect(() => {
        searchService.initialize(challenges);
    }, []);

    // 从本地存储加载筛选和排序选项
    useEffect(() => {
        // 只有当URL中没有参数时，才从本地存储加载
        if (!searchParams.toString()) {
            try {
                // 加载保存的筛选选项
                const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
                if (savedFilters) {
                    const parsedFilters = JSON.parse(savedFilters);
                    
                    // 应用保存的筛选器到URL，这将触发下一个useEffect
                    const newSearchParams = new URLSearchParams(searchParams);
                    
                    // 设置难度
                    if (parsedFilters.difficulty && parsedFilters.difficulty !== 'all') {
                        newSearchParams.set('difficulty', parsedFilters.difficulty);
                    }
                    
                    // 设置平台
                    if (parsedFilters.platform && parsedFilters.platform !== 'all') {
                        newSearchParams.set('platform', parsedFilters.platform);
                    }
                    
                    // 设置标签
                    if (parsedFilters.tags && parsedFilters.tags.length > 0) {
                        parsedFilters.tags.forEach((tag: string) => {
                            newSearchParams.append('tags', tag);
                        });
                    }
                    
                    if (newSearchParams.toString() !== searchParams.toString()) {
                        setSearchParams(newSearchParams);
                    }
                }
                
                // 加载保存的排序选项
                const savedSort = localStorage.getItem(SORT_STORAGE_KEY);
                if (savedSort) {
                    const parsedSort = JSON.parse(savedSort);
                    if (parsedSort.sortBy) setSortBy(parsedSort.sortBy);
                    if (parsedSort.sortOrder) setSortOrder(parsedSort.sortOrder);
                }
            } catch (error) {
                console.error("Error loading saved preferences:", error);
                // 如果出错，清除可能损坏的存储
                localStorage.removeItem(FILTER_STORAGE_KEY);
                localStorage.removeItem(SORT_STORAGE_KEY);
            }
        }
    }, []);  // 只在组件挂载时执行一次

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
        
        // 保存筛选设置到本地存储
        saveFilterPreferences({ ...filters, tags: newTags });
    };

    // 处理难度点击
    const handleDifficultyClick = (difficulty: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('difficulty', difficulty);
        navigate(`/challenges?${newSearchParams.toString()}`);
        
        // 保存筛选设置到本地存储
        saveFilterPreferences({ ...filters, difficulty });
    };

    // 处理平台筛选
    const handlePlatformChange = (platform: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('platform', platform);
        navigate(`/challenges?${newSearchParams.toString()}`);
        
        // 保存筛选设置到本地存储
        saveFilterPreferences({ ...filters, platform });
    };

    // 保存筛选偏好到本地存储
    const saveFilterPreferences = (newFilters: typeof filters) => {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newFilters));
    };

    // 保存排序偏好到本地存储
    const saveSortPreferences = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ 
            sortBy: newSortBy, 
            sortOrder: newSortOrder 
        }));
    };

    // 处理搜索
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // 重置分页到第一页
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // 处理排序方式变更
    const handleSortByChange = (sortByValue: string) => {
        setSortBy(sortByValue);
        saveSortPreferences(sortByValue, sortOrder);
    };

    // 处理排序顺序变更
    const handleSortOrderChange = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        saveSortPreferences(sortBy, newSortOrder);
    };

    // 从URL同步过滤器状态
    useEffect(() => {
        const tags = searchParams.getAll('tags');
        const difficulty = searchParams.get('difficulty') || 'all';
        const platform = searchParams.get('platform') || 'all';
        
        const newFilters = { tags, difficulty, platform };
        setFilters(newFilters);
        
        // 当URL发生变化时，同步到本地存储
        if (searchParams.toString()) {
            saveFilterPreferences(newFilters);
        }
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

    // 使用Fuse.js过滤和排序挑战
    const filteredChallenges = useMemo(() => {
        // 使用搜索服务过滤
        const filtered = searchService.filterChallenges(challenges, {
            tags: filters.tags,
            difficulty: filters.difficulty,
            platform: filters.platform,
            query: searchQuery
        });

        // 排序
        return filtered.sort((a: Challenge, b: Challenge) => {
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
        let newFilters = { ...filters };

        if (type === 'tag' && value) {
            const newTags = filters.tags.filter(t => t !== value);
            newSearchParams.delete('tags');
            newTags.forEach(t => newSearchParams.append('tags', t));
            newFilters = { ...newFilters, tags: newTags };
        } else if (type === 'difficulty') {
            newSearchParams.delete('difficulty');
            newFilters = { ...newFilters, difficulty: 'all' };
        } else if (type === 'platform') {
            newSearchParams.delete('platform');
            newFilters = { ...newFilters, platform: 'all' };
        }

        navigate(`/challenges?${newSearchParams.toString()}`);
        saveFilterPreferences(newFilters);
    };

    // 清空所有过滤器
    const handleClearAllFilters = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        newSearchParams.delete('difficulty');
        newSearchParams.delete('platform');
        navigate(`/challenges?${newSearchParams.toString()}`);
        
        // 清空筛选器本地存储或重置为默认值
        const defaultFilters = { tags: [], difficulty: 'all', platform: 'all' };
        saveFilterPreferences(defaultFilters);
    };

    // 多标签选择变更
    const handleTagsChange = (tags: string[]) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        tags.forEach(tag => newSearchParams.append('tags', tag));
        navigate(`/challenges?${newSearchParams.toString()}`);
        
        // 保存筛选设置到本地存储
        saveFilterPreferences({ ...filters, tags });
    };

    return (
        <div className="ChallengeListPage" style={{
            padding: '24px 0', // 移除左右内边距，只保留上下内边距
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
                    onSearch={handleSearch}
                    searchValue={searchQuery}
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
                    onSortByChange={handleSortByChange}
                    onSortOrderChange={handleSortOrderChange}
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