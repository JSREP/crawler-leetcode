import { Space, Tag, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import SearchBox from '../SearchBox';
import StarRating from '../StarRating';

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
    const { t } = useTranslation();
    
    return (
        <div>
            {/* 搜索框组件 */}
            <SearchBox 
                onSearch={onSearch}
                value={searchValue}
                placeholder={t('challenges.filters.search')}
                historyStorageKey="challenge-search-history"
            />
            
            {/* 已应用的过滤器 */}
            {hasFilters && (
                <Space wrap style={{ marginBottom: 16 }}>
                    {selectedDifficulty !== 'all' && (
                        <Tag
                            closable
                            onClose={onRemoveDifficulty}
                            style={{ background: '#f0f5ff', borderColor: '#adc6ff' }}
                        >
                            {t('challenges.sort.difficulty')}: <StarRating difficulty={parseInt(selectedDifficulty)} />
                        </Tag>
                    )}
                    
                    {selectedPlatform !== 'all' && (
                        <Tag
                            closable
                            onClose={onRemovePlatform}
                            color={selectedPlatform === 'LeetCode' ? 'orange' : 'purple'}
                        >
                            {t('challenge.detail.targetWebsite')}: {selectedPlatform}
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
                        {t('challenges.filters.clearAll')}
                    </Button>
                </Space>
            )}
        </div>
    );
};

export default ChallengeFilters; 