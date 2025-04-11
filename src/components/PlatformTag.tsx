import { Tag, Tooltip } from 'antd';
import * as React from 'react';

interface PlatformTagProps {
    /**
     * 平台名称
     */
    platform: string;
    
    /**
     * 是否可点击
     */
    clickable?: boolean;
    
    /**
     * 点击事件处理函数
     * @param platform 平台名称
     */
    onClick?: (platform: string) => void;
    
    /**
     * 提示文本
     */
    tooltip?: string;
    
    /**
     * 标签样式
     */
    style?: React.CSSProperties;
    
    /**
     * 是否阻止点击事件冒泡
     * 在列表项内部使用时通常需要设置为true
     */
    stopPropagation?: boolean;
}

/**
 * 平台标签组件
 * 用于显示挑战所属平台
 */
const PlatformTag: React.FC<PlatformTagProps> = ({
    platform,
    clickable = false,
    onClick,
    tooltip = "点击可按此平台筛选题目",
    style,
    stopPropagation = false
}) => {
    const getColor = () => {
        if (platform === 'LeetCode') {
            return 'orange';
        }
        return 'purple';
    };
    
    const handleClick = (e: React.MouseEvent) => {
        // 根据需要阻止事件冒泡
        if (stopPropagation) {
            e.stopPropagation();
        }
        
        // 如果有平台名称且提供了onClick回调，则调用
        if (platform && onClick) {
            onClick(platform);
        }
    };
    
    const cursor = clickable ? 'pointer' : undefined;
    const displayText = platform || '未指定';
    
    const tag = (
        <Tag
            color={getColor()}
            onClick={clickable ? handleClick : undefined}
            style={{ cursor, ...style }}
        >
            {displayText}
        </Tag>
    );
    
    return tooltip && clickable ? (
        <Tooltip title={tooltip} placement="top">
            {tag}
        </Tooltip>
    ) : tag;
};

export default PlatformTag; 