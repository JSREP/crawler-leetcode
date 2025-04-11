import { Space, Select, Button, Input } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import StarRating from '../StarRating';
import { useMemo } from 'react';
import { Col } from 'antd';

const { Search } = Input;
const { Option } = Select;

interface ChallengeControlsProps {
    /**
     * 所有可选标签
     */
    allTags: string[];
    
    /**
     * 所有可选平台
     */
    allPlatforms: string[];
    
    /**
     * 当前选中的标签
     */
    selectedTags: string[];
    
    /**
     * 当前选中的难度
     */
    selectedDifficulty: string;
    
    /**
     * 当前选中的平台
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
    onSortByChange: (field: string) => void;
    
    /**
     * 排序顺序变更回调
     */
    onSortOrderChange: () => void;
    
    /**
     * 搜索提交回调
     */
    onSearch: (value: string) => void;
}

/**
 * 挑战列表的搜索和控制组件
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
    onSortOrderChange,
    onSearch
}) => {
    // 确保LeetCode平台在平台列表中
    const platformOptions = useMemo(() => {
        const platforms = [...new Set([...allPlatforms, 'LeetCode'])];
        return [
            { value: 'all', label: '所有平台' },
            ...platforms.map(platform => ({ value: platform, label: platform }))
        ];
    }, [allPlatforms]);

    return (
        <Space wrap>
            <Select
                mode="multiple"
                placeholder="筛选标签"
                style={{ width: 200 }}
                value={selectedTags}
                onChange={onTagsChange}
                options={allTags.map(tag => ({ label: tag, value: tag }))}
            />

            <Select
                placeholder="选择难度"
                style={{ width: 140 }}
                value={selectedDifficulty}
                onChange={onDifficultyChange}
            >
                <Option value="all">全部难度</Option>
                {[1, 2, 3, 4, 5].map(n => (
                    <Option key={n} value={String(n)}>
                        <StarRating difficulty={n} />
                    </Option>
                ))}
            </Select>

            <Select
                style={{ width: 140 }}
                value={selectedPlatform}
                onChange={onPlatformChange}
                options={platformOptions}
            />

            <Select
                value={sortBy}
                style={{ width: 120 }}
                onChange={onSortByChange}
            >
                <Option value="number">编号排序</Option>
                <Option value="difficulty">难度排序</Option>
                <Option value="createTime">创建时间</Option>
                <Option value="updateTime">更新时间</Option>
            </Select>

            <Button
                icon={sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                onClick={onSortOrderChange}
            />

            <Search
                placeholder="搜索题目"
                allowClear
                style={{ width: 200 }}
                onSearch={onSearch}
            />
        </Space>
    );
};

export default ChallengeControls; 