import { Space, Tag, Button, Input, Divider, Tooltip, Typography } from 'antd';
import { CloseOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import StarRating from '../StarRating';
import { useState, useEffect, useCallback } from 'react';

const { Search } = Input;
const { Text } = Typography;

// 防抖函数：避免频繁触发搜索
const debounce = (fn: Function, delay: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    };
};

interface ChallengeFiltersProps {
    /**
     * 选中的标签
     */
    selectedTags: string[];
    
    /**
     * 选中的难度
     */
    selectedDifficulty: string;
    
    /**
     * 选中的平台
     */
    selectedPlatform: string;
    
    /**
     * 是否有过滤器被应用
     */
    hasFilters: boolean;
    
    /**
     * 删除单个标签的回调
     */
    onRemoveTag: (tag: string) => void;
    
    /**
     * 移除难度过滤的回调
     */
    onRemoveDifficulty: () => void;
    
    /**
     * 移除平台过滤的回调
     */
    onRemovePlatform: () => void;
    
    /**
     * 清除所有过滤器的回调
     */
    onClearAll: () => void;

    /**
     * 搜索提交回调
     */
    onSearch: (value: string) => void;

    /**
     * 当前的搜索值
     */
    searchValue?: string;
}

/**
 * 搜索提示信息
 */
const SEARCH_TOOLTIP = (
    <div style={{ maxWidth: 300 }}>
        <Text strong>高级搜索提示：</Text>
        <ul style={{ paddingLeft: 20, marginTop: 5, marginBottom: 5 }}>
            <li>搜索题目标题、描述、标签等所有字段</li>
            <li>支持模糊搜索和拼写容错</li>
            <li>多关键词: "动态规划 数组"</li>
            <li>精确匹配: "=动态规划"</li>
            <li>排除词: "!二叉树"</li>
            <li>前缀匹配: "链^"</li>
            <li>直接输入题号进行搜索</li>
        </ul>
    </div>
);

/**
 * 已应用的过滤条件显示组件
 */
const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
    selectedTags,
    selectedDifficulty,
    selectedPlatform,
    hasFilters,
    onRemoveTag,
    onRemoveDifficulty,
    onRemovePlatform,
    onClearAll,
    onSearch,
    searchValue = ''
}) => {
    // 内部状态用于实时显示搜索框中的文本
    const [inputValue, setInputValue] = useState(searchValue);
    
    // 搜索建议状态
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    
    // 当外部searchValue变化时，更新内部inputValue
    useEffect(() => {
        setInputValue(searchValue);
    }, [searchValue]);
    
    // 创建防抖搜索函数，延迟300ms
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            onSearch(value);
            // 只有用户主动输入的搜索才加入历史记录
            if (value.trim()) {
                const searches = JSON.parse(localStorage.getItem('recent-searches') || '[]');
                const newSearches = [value, ...searches.filter((s: string) => s !== value)].slice(0, 5);
                localStorage.setItem('recent-searches', JSON.stringify(newSearches));
                setRecentSearches(newSearches);
            }
        }, 300),
        [onSearch]
    );
    
    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSearch(value);
    };
    
    // 加载最近搜索记录
    useEffect(() => {
        const searches = JSON.parse(localStorage.getItem('recent-searches') || '[]');
        setRecentSearches(searches);
    }, []);

    return (
        <div>
            {/* 搜索框，占满整行 */}
            <div style={{ position: 'relative' }}>
                <Search
                    placeholder="搜索题目、标签、编号..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    style={{ 
                        width: '100%', 
                        marginBottom: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onSearch={(value: string) => debouncedSearch(value)}
                />
                <Tooltip title={SEARCH_TOOLTIP} placement="bottomRight">
                    <InfoCircleOutlined 
                        style={{ 
                            position: 'absolute', 
                            right: 60, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: 'rgba(0,0,0,0.45)',
                            cursor: 'pointer'
                        }} 
                    />
                </Tooltip>
            </div>
            
            {/* 最近搜索记录 */}
            {recentSearches.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ marginRight: 8 }}>最近搜索:</Text>
                    <Space>
                        {recentSearches.map((search, index) => (
                            <Tag 
                                key={index}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setInputValue(search);
                                    debouncedSearch(search);
                                }}
                            >
                                {search}
                            </Tag>
                        ))}
                        <Button 
                            type="text" 
                            size="small"
                            onClick={() => {
                                localStorage.removeItem('recent-searches');
                                setRecentSearches([]);
                            }}
                        >
                            清除
                        </Button>
                    </Space>
                </div>
            )}
            
            {/* 已应用的过滤器 */}
            {hasFilters && (
                <Space wrap style={{ marginBottom: 16 }}>
                    {selectedDifficulty !== 'all' && (
                        <Tag
                            closable
                            onClose={onRemoveDifficulty}
                            style={{ background: '#f0f5ff', borderColor: '#adc6ff' }}
                        >
                            难度: <StarRating difficulty={parseInt(selectedDifficulty)} />
                        </Tag>
                    )}
                    
                    {selectedPlatform !== 'all' && (
                        <Tag
                            closable
                            onClose={onRemovePlatform}
                            color={selectedPlatform === 'LeetCode' ? 'orange' : 'purple'}
                        >
                            平台: {selectedPlatform}
                        </Tag>
                    )}
                    
                    {selectedTags.map(tag => (
                        <Tag
                            key={tag}
                            closable
                            onClose={() => onRemoveTag(tag)}
                            style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}
                        >
                            {tag}
                        </Tag>
                    ))}
                    
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClearAll}
                        style={{ color: '#ff4d4f' }}
                    >
                        清空所有
                    </Button>
                </Space>
            )}
        </div>
    );
};

export default ChallengeFilters; 