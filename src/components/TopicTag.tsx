import { Tag, Tooltip } from 'antd';
import * as React from 'react';

interface TopicTagProps {
    /**
     * 标签文本
     */
    text: string;
    
    /**
     * 是否可点击
     */
    clickable?: boolean;
    
    /**
     * 点击事件处理函数
     * @param tag 标签文本
     */
    onClick?: (tag: string) => void;
    
    /**
     * 提示文本
     */
    tooltip?: string;
    
    /**
     * 是否被选中
     */
    selected?: boolean;
    
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
 * 主题标签组件
 * 用于显示挑战的标签/主题
 */
const TopicTag: React.FC<TopicTagProps> = ({
    text,
    clickable = false,
    onClick,
    tooltip = "点击可按此标签筛选题目",
    selected = false,
    style,
    stopPropagation = false
}) => {
    // 根据是否被选中设置颜色 - 固定颜色方案
    // 未选中时使用蓝色，选中时使用深蓝色
    const tagColor = selected ? 'geekblue' : 'blue';
    const cursor = clickable ? 'pointer' : undefined;
    
    const handleClick = (e: React.MouseEvent) => {
        // 根据需要阻止事件冒泡
        if (stopPropagation) {
            e.stopPropagation();
        }
        
        // 如果有标签文本且提供了onClick回调，则调用
        if (text && onClick) {
            onClick(text);
        }
    };
    
    const tag = (
        <Tag
            color={tagColor}
            onClick={clickable ? handleClick : undefined}
            style={{ cursor, ...style }}
        >
            {text}
        </Tag>
    );
    
    return tooltip && clickable ? (
        <Tooltip title={tooltip} placement="top">
            {tag}
        </Tooltip>
    ) : tag;
};

export default TopicTag; 