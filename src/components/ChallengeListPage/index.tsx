import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Space, Row, Col, Drawer, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { Challenge } from '../../types/challenge';
import { challenges } from './ChallengeData';
import ChallengeFilters from './ChallengeFilters';
import ChallengeControls from './ChallengeControls';
import SimpleChallengeList from './SimpleChallengeList';
import { searchService } from '../../services/SearchService';
import { useMediaQuery } from 'react-responsive';

// 本地存储键
const FILTER_STORAGE_KEY = 'challenge-filter-preferences';
const SORT_STORAGE_KEY = 'challenge-sort-preferences';

/**
 * 挑战列表页面组件
 * 展示所有挑战，支持过滤、排序和搜索
 */
const ChallengeListPage = () => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [filters, setFilters] = useState({
        difficulty: [] as string[],
        tags: [] as string[],
        platform: 'all'
    });
    const [sortBy, setSortBy] = useState('updateTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: isMobile ? 5 : 10 });
    const [drawerVisible, setDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 调整页面大小响应窗口变化
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageSize: isMobile ? 5 : 10 }));
    }, [isMobile]);

    // 过滤掉被标记为忽略的挑战
    const visibleChallenges = useMemo(() => {
        console.log(`总挑战数量: ${challenges.length}`);
        const visible = challenges.filter(challenge => challenge.ignored !== true);
        console.log(`可见挑战数量(排除ignored=true): ${visible.length}`);
        return visible;
    }, [challenges]);

    // 初始化搜索服务
    useEffect(() => {
        searchService.initialize(visibleChallenges);
    }, [visibleChallenges]);

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
                    if (parsedFilters.difficulty && parsedFilters.difficulty.length > 0) {
                        parsedFilters.difficulty.forEach((difficulty: string) => {
                            newSearchParams.append('difficulty', difficulty);
                        });
                    }
                    
                    // 设置平台
                    if (parsedFilters.platform && parsedFilters.platform.length > 0) {
                        parsedFilters.platform.forEach((platform: string) => {
                            newSearchParams.append('platform', platform);
                        });
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
        const currentDifficulties = filters.difficulty;
        
        // 检查是否已选中该难度
        const isSelected = currentDifficulties.includes(difficulty);
        
        if (difficulty === 'all') {
            // 如果选择"全部"，则清除所有难度筛选
            newSearchParams.delete('difficulty');
            filters.difficulty = [];
        } else if (isSelected) {
            // 如果已选中，则取消选中
            const newDifficulties = currentDifficulties.filter(d => d !== difficulty);
            newSearchParams.delete('difficulty');
            newDifficulties.forEach(d => newSearchParams.append('difficulty', d));
            filters.difficulty = newDifficulties;
        } else {
            // 如果未选中，则添加选中
            const newDifficulties = [...currentDifficulties, difficulty];
            newSearchParams.delete('difficulty');
            newDifficulties.forEach(d => newSearchParams.append('difficulty', d));
            filters.difficulty = newDifficulties;
        }

        navigate(`/challenges?${newSearchParams.toString()}`);
        
        // 保存筛选设置到本地存储
        saveFilterPreferences({ ...filters, difficulty: filters.difficulty });
    };

    // 从URL同步过滤器状态
    useEffect(() => {
        const tags = searchParams.getAll('tags');
        let difficultyParams = searchParams.getAll('difficulty');
        const platformParam = searchParams.get('platform') || 'all';
        
        console.log('URL平台参数:', platformParam);
        
        // 处理特殊难度字符串转换
        if (difficultyParams.length === 1) {
            const diffParam = difficultyParams[0];
            if (diffParam === 'easy') {
                difficultyParams = ['1'];
            } else if (diffParam === 'medium') {
                difficultyParams = ['2', '3'];
            } else if (diffParam === 'hard') {
                difficultyParams = ['4', '5'];
            }
        }
        
        const newFilters = { 
            tags, 
            difficulty: difficultyParams, 
            platform: platformParam 
        };
        
        console.log('设置新筛选条件:', newFilters);
        setFilters(newFilters);
        
        // 当URL发生变化时，同步到本地存储
        if (searchParams.toString()) {
            saveFilterPreferences(newFilters);
        }
    }, [searchParams]);

    // 处理平台筛选
    const handlePlatformChange = (platform: string) => {
        console.log('处理平台筛选变化:', platform);
        
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('platform');
        
        // 如果选择的不是"all"，则添加平台参数
        if (platform !== 'all') {
            newSearchParams.append('platform', platform);
        }
        
        console.log('新URL参数:', newSearchParams.toString());
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

    // 显示过滤器抽屉（移动端）
    const showDrawer = () => {
        setDrawerVisible(true);
    };

    // 关闭过滤器抽屉（移动端）
    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    // 获取所有可用标签
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        visibleChallenges.forEach((challenge: Challenge) => challenge.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, [visibleChallenges]);

    // 获取所有可用平台
    const allPlatforms = useMemo(() => {
        const platforms = new Set<string>();
        visibleChallenges.forEach((challenge: Challenge) => {
            if (challenge.platform) {
                platforms.add(challenge.platform);
            }
        });
        return Array.from(platforms);
    }, [visibleChallenges]);

    // 使用Fuse.js过滤和排序挑战
    const filteredChallenges = useMemo(() => {
        // 使用搜索服务过滤
        console.log(`过滤前挑战数量: ${visibleChallenges.length}`);
        console.log(`过滤条件:`, {
            tags: filters.tags,
            difficulty: filters.difficulty.join(','),
            platform: filters.platform,
            query: searchQuery
        });
        
        const filtered = searchService.filterChallenges(visibleChallenges, {
            tags: filters.tags,
            difficulty: filters.difficulty.join(','),
            platform: filters.platform,
            query: searchQuery
        });
        
        console.log(`过滤后挑战数量: ${filtered.length}`);

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
    }, [filters, searchQuery, sortBy, sortOrder, visibleChallenges]);

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
            if (value) {
                // 仅移除单个难度
                const newDifficulties = filters.difficulty.filter(d => d !== value);
                newSearchParams.delete('difficulty');
                newDifficulties.forEach(d => newSearchParams.append('difficulty', d));
                newFilters = { ...newFilters, difficulty: newDifficulties };
            } else {
                // 移除所有难度
                newSearchParams.delete('difficulty');
                newFilters = { ...newFilters, difficulty: [] };
            }
        } else if (type === 'platform') {
            newSearchParams.delete('platform');
            newFilters = { ...newFilters, platform: 'all' };
        }

        setSearchParams(newSearchParams);
        saveFilterPreferences(newFilters);
    };

    // 清除所有过滤器
    const handleClearAllFilters = () => {
        const newSearchParams = new URLSearchParams();
        setSearchParams(newSearchParams);
        const newFilters = { tags: [], difficulty: [], platform: 'all' };
        setFilters(newFilters);
        saveFilterPreferences(newFilters);
    };

    // 处理标签变更 (从标签下拉菜单)
    const handleTagsChange = (tags: string[]) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        tags.forEach(tag => newSearchParams.append('tags', tag));
        setSearchParams(newSearchParams);
        saveFilterPreferences({ ...filters, tags });
    };

    // 获取应用的过滤器数量
    const getAppliedFiltersCount = () => {
        let count = 0;
        if (filters.difficulty.length > 0) count++;
        if (filters.platform !== 'all') count++;
        count += filters.tags.length;
        return count;
    };

    // 渲染控制面板（桌面或移动）
    const renderControls = () => {
        console.log('渲染控制面板，当前平台选择:', filters.platform);
        return (
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
        );
    };

    // 渲染过滤器（适用于桌面和移动视图）
    const renderFilters = () => (
        <ChallengeFilters
            selectedTags={filters.tags}
            selectedDifficulty={filters.difficulty}
            selectedPlatform={filters.platform}
            hasFilters={filters.tags.length > 0 || filters.difficulty.length > 0 || filters.platform !== 'all'}
            onRemoveTag={(tag) => handleFilterRemove('tag', tag)}
            onRemoveDifficulty={() => handleFilterRemove('difficulty')}
            onRemovePlatform={() => handleFilterRemove('platform')}
            onClearAll={handleClearAllFilters}
            onSearch={handleSearch}
            searchValue={searchQuery}
        />
    );

    return (
        <div className="challenge-list-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '1rem' }}>
                        {t('challenges.title')}
                        <span style={{ fontWeight: 'normal', fontSize: isMobile ? '1.2rem' : '1.6rem', marginLeft: '8px' }}>
                            ({filteredChallenges.length})
                        </span>
                    </h1>
                    
                    {/* 移动端搜索和过滤器 */}
                    {isMobile ? (
                        <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
                            <Col span={24}>
                                {renderFilters()}
                            </Col>
                            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button 
                                    type="primary" 
                                    icon={<FilterOutlined />} 
                                    onClick={showDrawer}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                >
                                    {t('challenges.controls.filter')}
                                    {getAppliedFiltersCount() > 0 && ` (${getAppliedFiltersCount()})`}
                                </Button>
                            </Col>
                        </Row>
                    ) : (
                        <>
                            {renderFilters()}
                            {renderControls()}
                        </>
                    )}
                    
                    {/* 挑战列表 */}
                    <SimpleChallengeList
                        challenges={paginatedData}
                        selectedTags={filters.tags}
                        pagination={pagination}
                        total={filteredChallenges.length}
                        onPaginationChange={handlePaginationChange}
                        onTagClick={handleTagClick}
                        onDifficultyClick={(difficulty) => handleDifficultyClick(difficulty.toString())}
                        onPlatformClick={(platform) => handlePlatformChange(platform)}
                        onChallengeClick={(id) => navigate(`/challenge/${id}`)}
                        hidePagination={false}
                    />
                </Col>
            </Row>

            {/* 移动端过滤抽屉 */}
            {isMobile && (
                <Drawer
                    title={t('challenges.controls.filterAndSort')}
                    placement="right"
                    closable={true}
                    onClose={closeDrawer}
                    open={drawerVisible}
                    width={300}
                    bodyStyle={{ padding: '12px' }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {renderControls()}
                    </Space>
                </Drawer>
            )}
        </div>
    );
};

export default ChallengeListPage; 