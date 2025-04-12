import { Select, Divider, Space, Dropdown, Button, Menu, Checkbox } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined, TagOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import StarRating from '../StarRating';

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
    selectedDifficulty: string;
    
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
            selectedKeys={[selectedDifficulty]}
            onClick={({ key }) => onDifficultyChange(key)}
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
            onClick={({ key }) => onPlatformChange(key)}
        >
            <Menu.Item key="all">{t('challenges.filters.allPlatforms')}</Menu.Item>
            {allPlatforms.map(platform => (
                <Menu.Item key={platform}>{platform}</Menu.Item>
            ))}
        </Menu>
    );
    
    // 标签选择菜单
    const tagMenu = (
        <div style={{ 
            padding: '12px', 
            maxHeight: '400px', 
            overflowY: 'auto', 
            minWidth: '200px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
            border: '1px solid #f0f0f0'
        }}>
            <Checkbox.Group 
                options={allTags.map(tag => ({ label: tag, value: tag }))} 
                value={selectedTags}
                onChange={tags => onTagsChange(tags as string[])}
            />
        </div>
    );
    
    return (
        <Space split={<Divider type="vertical" />} style={{ marginBottom: 20 }}>
            {/* 标签过滤 */}
            <Dropdown overlay={tagMenu} trigger={['click']}>
                <Button icon={<TagOutlined />}>
                    {t('challenges.filters.tags')} {selectedTags.length > 0 && `(${selectedTags.length})`} <DownOutlined />
                </Button>
            </Dropdown>
            
            {/* 难度过滤 */}
            <Dropdown overlay={difficultyMenu} trigger={['click']}>
                <Button icon={<FilterOutlined />}>
                    {t('challenges.filters.difficulty')} <DownOutlined />
                </Button>
            </Dropdown>
            
            {/* 平台过滤 */}
            <Dropdown overlay={platformMenu} trigger={['click']}>
                <Button icon={<FilterOutlined />}>
                    {t('challenges.controls.platform')} <DownOutlined />
                </Button>
            </Dropdown>
            
            {/* 排序控制 - 移到最后 */}
            <Space>
                <Dropdown overlay={sortMenu} trigger={['click']}>
                    <Button>
                        {t('challenges.controls.sortBy')}: {t(`challenges.sort.${sortBy}`)} <DownOutlined />
                    </Button>
                </Dropdown>
                <Button 
                    icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    onClick={onSortOrderChange}
                    title={sortOrder === 'asc' ? t('challenges.controls.ascending') : t('challenges.controls.descending')}
                />
            </Space>
        </Space>
    );
};

export default ChallengeControls; 