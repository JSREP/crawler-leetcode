import { Select, Divider, Space, Dropdown, Button, Menu, Checkbox, Input } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, TagOutlined, FilterOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useState, ChangeEvent, useRef, useEffect } from 'react';
import StarRating from '../StarRating';
import { useMediaQuery } from 'react-responsive';

// 定义平台枚举值
const PLATFORM_TYPES = [
  'Web', 
  'Android', 
  'iOS', 
  'WeChat-MiniProgram', 
  'Electron', 
  'Windows-Native', 
  'Mac-Native', 
  'Linux-Native'
];

interface ChallengeControlsProps {
    /**
     * 所有可用的标签
     */
    allTags: string[];
    
    /**
     * 所有可用的平台
     */
    allPlatforms: string[];
    
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
     * 当前排序字段
     */
    sortBy: string;
    
    /**
     * 当前排序顺序
     */
    sortOrder: 'asc' | 'desc';
    
    /**
     * 标签变更回调
     */
    onTagsChange: (tags: string[]) => void;
    
    /**
     * 难度变更回调
     */
    onDifficultyChange: (difficulty: string) => void;
    
    /**
     * 平台变更回调
     */
    onPlatformChange: (platform: string) => void;
    
    /**
     * 排序字段变更回调
     */
    onSortByChange: (sortBy: string) => void;
    
    /**
     * 排序顺序变更回调
     */
    onSortOrderChange: () => void;
}

/**
 * 挑战列表的控制面板组件
 * 包含排序、过滤等操作
 */
const ChallengeControls: React.FC<ChallengeControlsProps> = ({
    allTags,
    allPlatforms,
    selectedTags,
    selectedDifficulty,
    selectedPlatform,
    sortBy,
    sortOrder,
    onTagsChange,
    onDifficultyChange,
    onPlatformChange,
    onSortByChange,
    onSortOrderChange
}) => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 在组件的开头部分添加状态
    const [tagSearchText, setTagSearchText] = useState('');
    
    // 确保containerRef挂载后才渲染Dropdown
    const [isContainerMounted, setIsContainerMounted] = useState(false);
    
    useEffect(() => {
        if (containerRef.current) {
            setIsContainerMounted(true);
        }
    }, []);
    
    // 排序功能菜单
    const sortMenu = (
        <Menu 
            selectedKeys={[sortBy]}
            onClick={({ key }) => onSortByChange(key)}
        >
            <Menu.Item key="number">{t('challenges.sort.number')}</Menu.Item>
            <Menu.Item key="difficulty">{t('challenges.sort.difficulty')}</Menu.Item>
            <Menu.Item key="createTime">{t('challenges.sort.createTime')}</Menu.Item>
            <Menu.Item key="updateTime">{t('challenges.sort.updateTime')}</Menu.Item>
        </Menu>
    );
    
    // 难度过滤菜单
    const difficultyMenu = (
        <Menu
            selectedKeys={selectedDifficulty}
            onClick={({ key }) => onDifficultyChange(key)}
            multiple={false}
        >
            <Menu.Item key="all">{t('challenges.filters.allDifficulties')}</Menu.Item>
            <Menu.Item key="1">
                <StarRating difficulty={1} onClick={() => {}} style={{ cursor: 'pointer' }} />
            </Menu.Item>
            <Menu.Item key="2">
                <StarRating difficulty={2} onClick={() => {}} style={{ cursor: 'pointer' }} />
            </Menu.Item>
            <Menu.Item key="3">
                <StarRating difficulty={3} onClick={() => {}} style={{ cursor: 'pointer' }} />
            </Menu.Item>
            <Menu.Item key="4">
                <StarRating difficulty={4} onClick={() => {}} style={{ cursor: 'pointer' }} />
            </Menu.Item>
            <Menu.Item key="5">
                <StarRating difficulty={5} onClick={() => {}} style={{ cursor: 'pointer' }} />
            </Menu.Item>
        </Menu>
    );
    
    // 平台过滤菜单
    const platformMenu = (
        <Menu
            selectedKeys={[selectedPlatform]}
            onClick={({ key }) => onPlatformChange(key.toString())}
            multiple={false}
        >
            <Menu.Item key="all">{t('challenges.filters.allPlatforms')}</Menu.Item>
            {/* 使用固定的平台枚举列表，而不是从挑战中提取的 */}
            {PLATFORM_TYPES.map(platform => (
                <Menu.Item key={platform}>{platform}</Menu.Item>
            ))}
        </Menu>
    );
    
    // 标签选择菜单
    const tagMenu = (
        <div style={{ 
            padding: '12px', 
            maxHeight: isMobile ? '300px' : '400px', 
            overflowY: 'auto', 
            minWidth: isMobile ? '250px' : '300px',
            maxWidth: isMobile ? '80vw' : '400px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
            border: '1px solid #f0f0f0',
            zIndex: 1050,
            transform: 'translateZ(0)', // 开启硬件加速
            willChange: 'transform, opacity' // 提示浏览器优化渲染
        }}>
            {/* 添加标签搜索框 */}
            <Input 
                prefix={<SearchOutlined />}
                placeholder={t('challenges.filters.searchTags')}
                style={{ marginBottom: '12px' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setTagSearchText(e.target.value);
                }}
                allowClear
                autoFocus={false} // 防止自动聚焦导致的布局计算问题
            />
            
            {/* 标签列表，使用Grid布局优化显示 */}
            <div>
                <Checkbox.Group 
                    value={selectedTags}
                    onChange={tags => onTagsChange(tags as string[])}
                    style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        width: '100%',
                        gap: '6px'
                    }}
                >
                    {allTags
                        .filter(tag => tag.toLowerCase().includes(tagSearchText.toLowerCase()))
                        .map(tag => (
                            <Checkbox 
                                key={tag} 
                                value={tag} 
                                style={{ 
                                    marginRight: 0,
                                    marginBottom: 0,
                                    width: 'auto',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: isMobile ? '12px' : '13px'
                                }}
                            >
                                {tag}
                            </Checkbox>
                        ))
                    }
                </Checkbox.Group>
            </div>
        </div>
    );
    
    return (
        <div ref={containerRef} className="challenge-controls-container" style={{ position: 'relative' }}>
            <Space 
                split={isMobile ? null : <Divider type="vertical" />} 
                style={{ marginBottom: isMobile ? 12 : 20 }}
                direction={isMobile ? "vertical" : "horizontal"}
                size={isMobile ? 8 : "middle"}
                wrap={!isMobile}
            >
                {/* 标签过滤 */}
                {isContainerMounted && (
                    <Dropdown 
                        overlay={tagMenu} 
                        trigger={['click']} 
                        placement={isMobile ? "bottomCenter" : "bottomLeft"}
                        overlayStyle={{ 
                            marginTop: '8px',
                            zIndex: 1050
                        }}
                        getPopupContainer={() => containerRef.current || document.body}
                        destroyPopupOnHide={true}
                        mouseEnterDelay={0.1}
                        mouseLeaveDelay={0.1}
                    >
                        <Button 
                            icon={<TagOutlined />}
                            size={isMobile ? "middle" : "default"}
                            style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
                        >
                            {t('challenges.filters.tags')} {selectedTags.length > 0 && `(${selectedTags.length})`} <DownOutlined />
                        </Button>
                    </Dropdown>
                )}
                
                {/* 难度过滤 */}
                {isContainerMounted && (
                    <Dropdown 
                        overlay={difficultyMenu} 
                        trigger={['click']}
                        placement={isMobile ? "bottomCenter" : "bottomLeft"}
                        getPopupContainer={() => containerRef.current || document.body}
                        destroyPopupOnHide={true}
                    >
                        <Button 
                            icon={<FilterOutlined />}
                            size={isMobile ? "middle" : "default"}
                            style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
                        >
                            {t('challenges.filters.difficulty')} <DownOutlined />
                        </Button>
                    </Dropdown>
                )}
                
                {/* 平台过滤 */}
                {isContainerMounted && (
                    <Dropdown 
                        overlay={platformMenu} 
                        trigger={['click']}
                        placement={isMobile ? "bottomCenter" : "bottomLeft"}
                        getPopupContainer={() => containerRef.current || document.body}
                        destroyPopupOnHide={true}
                    >
                        <Button 
                            icon={<FilterOutlined />}
                            size={isMobile ? "middle" : "default"}
                            style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
                        >
                            {t('challenges.controls.platform')} <DownOutlined />
                        </Button>
                    </Dropdown>
                )}
                
                {/* 排序控制 - 移到最后 */}
                <Space style={{ width: isMobile ? '100%' : 'auto' }}>
                    {isContainerMounted && (
                        <Dropdown 
                            overlay={sortMenu} 
                            trigger={['click']}
                            placement={isMobile ? "bottomCenter" : "bottomLeft"}
                            getPopupContainer={() => containerRef.current || document.body}
                            destroyPopupOnHide={true}
                        >
                            <Button
                                size={isMobile ? "middle" : "default"}
                                style={{ 
                                    width: isMobile ? 'calc(100% - 32px)' : 'auto', 
                                    justifyContent: 'space-between', 
                                    display: 'flex', 
                                    alignItems: 'center'
                                }}
                            >
                                {isMobile ? t(`challenges.sort.${sortBy}`) : `${t('challenges.controls.sortBy')}: ${t(`challenges.sort.${sortBy}`)}`} <DownOutlined />
                            </Button>
                        </Dropdown>
                    )}
                    <Button 
                        icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                        onClick={onSortOrderChange}
                        title={sortOrder === 'asc' ? t('challenges.controls.ascending') : t('challenges.controls.descending')}
                        size={isMobile ? "middle" : "default"}
                    />
                </Space>
            </Space>
        </div>
    );
};

export default ChallengeControls; 