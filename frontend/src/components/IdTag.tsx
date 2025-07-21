import { Tag, Tooltip } from 'antd';
import * as React from 'react';

interface IdTagProps {
    /**
     * 挑战ID
     */
    id: React.ReactNode;
    
    /**
     * 是否可点击
     */
    clickable?: boolean;
    
    /**
     * 点击事件处理函数
     */
    onClick?: () => void;
    
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
 * ID标签组件
 * 用于显示挑战ID
 */
const IdTag: React.FC<IdTagProps> = ({
    id,
    clickable = false,
    onClick,
    tooltip = "点击返回挑战列表",
    style,
    stopPropagation = false
}) => {
    // 确保id有值
    const displayId = id ?? '?';
    const cursor = clickable ? 'pointer' : undefined;
    
    const handleClick = (e: React.MouseEvent) => {
        // 根据需要阻止事件冒泡
        if (stopPropagation) {
            e.stopPropagation();
        }
        
        // 如果提供了onClick回调，则调用
        if (onClick) {
            onClick();
        }
    };
    
    const tag = (
        <Tag
            color="#108ee9"
            onClick={clickable ? handleClick : undefined}
            style={{ cursor, ...style }}
        >
            #{displayId}
        </Tag>
    );
    
    return tooltip && clickable ? (
        <Tooltip title={tooltip} placement="top">
            {tag}
        </Tooltip>
    ) : tag;
};

export default IdTag; 