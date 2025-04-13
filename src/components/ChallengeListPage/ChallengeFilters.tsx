import { Space, Tag, Button, Row, Col } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import SearchBox from '../SearchBox';
import StarRating from '../StarRating';
import { useMediaQuery } from 'react-responsive';

interface ChallengeFiltersProps {
    /**
     * 选中的标签
     */
    selectedTags: string[];
    
    /**
     * 选中的难度
     */
    selectedDifficulty: string[];
    
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
    const isMobile = useMediaQuery({ maxWidth: 768 });
    
    return (
        <div>
            {/* 搜索框组件 - 移除style属性，使用div包装处理边距 */}
            <div style={{ marginBottom: isMobile ? '8px' : '16px' }}>
                <SearchBox 
                    onSearch={onSearch}
                    value={searchValue}
                    placeholder={t('challenges.filters.search')}
                    historyStorageKey="challenge-search-history"
                />
            </div>
            
            {/* 已应用的过滤器 */}
            {hasFilters && (
                <Row gutter={[8, 8]} style={{ marginBottom: isMobile ? '8px' : '16px' }}>
                    <Col span={24}>
                        <Space wrap size={isMobile ? 4 : 8} style={{ width: '100%' }}>
                            {selectedDifficulty.length > 0 && (
                                <Tag
                                    closable
                                    onClose={onRemoveDifficulty}
                                    style={{ 
                                        background: '#f0f5ff',
                                        borderColor: '#adc6ff',
                                        fontSize: isMobile ? '12px' : '14px',
                                        padding: isMobile ? '0 4px' : '0 7px',
                                        margin: isMobile ? '0 4px 4px 0' : '0 8px 8px 0'
                                    }}
                                >
                                    {isMobile ? '' : `${t('challenges.sort.difficulty')}: `}
                                    <Space size={2}>
                                        {selectedDifficulty.map(diff => (
                                            <StarRating key={diff} difficulty={parseInt(diff)} />
                                        ))}
                                    </Space>
                                </Tag>
                            )}
                            
                            {selectedPlatform !== 'all' && (
                                <Tag
                                    closable
                                    onClose={onRemovePlatform}
                                    color={selectedPlatform === 'LeetCode' ? 'orange' : 'purple'}
                                    style={{ 
                                        fontSize: isMobile ? '12px' : '14px',
                                        padding: isMobile ? '0 4px' : '0 7px',
                                        margin: isMobile ? '0 4px 4px 0' : '0 8px 8px 0'
                                    }}
                                >
                                    {isMobile ? selectedPlatform : `${t('challenge.detail.platform')}: ${selectedPlatform}`}
                                </Tag>
                            )}
                            
                            {selectedTags.map(tag => (
                                <Tag
                                    key={tag}
                                    closable
                                    onClose={() => onRemoveTag(tag)}
                                    style={{ 
                                        background: '#f6ffed',
                                        borderColor: '#b7eb8f',
                                        fontSize: isMobile ? '12px' : '14px',
                                        padding: isMobile ? '0 4px' : '0 7px',
                                        margin: isMobile ? '0 4px 4px 0' : '0 8px 8px 0'
                                    }}
                                >
                                    {tag}
                                </Tag>
                            ))}
                            
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={onClearAll}
                                style={{ 
                                    color: '#ff4d4f',
                                    fontSize: isMobile ? '12px' : '14px',
                                    height: isMobile ? '22px' : '28px',
                                    padding: isMobile ? '0 4px' : '0 8px'
                                }}
                            >
                                {isMobile ? t('challenges.filters.clearAllShort') : t('challenges.filters.clearAll')}
                            </Button>
                        </Space>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default ChallengeFilters; 