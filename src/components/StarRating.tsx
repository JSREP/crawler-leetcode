/**
 * 星级评分组件
 * 用于显示难度等级或评分，支持1-5星的展示和交互
 */
import { Tag, Tooltip } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import '../styles/star-rating.css'; // 正确的路径
import { useTranslation } from 'react-i18next';

/**
 * 星级评分组件的属性接口
 * 
 * @interface StarRatingProps
 * @property {number} difficulty - 难度等级/评分值(1-5)
 * @property {Function} [onClick] - 可选的点击事件处理函数，点击时会传入当前难度值
 * @property {string} [tooltip] - 提示文本
 * @property {boolean} [stopPropagation] - 是否阻止点击事件冒泡
 * @property {React.CSSProperties} [style] - 组件样式
 */
interface StarRatingProps {
    difficulty: number;
    onClick?: (difficulty: number) => void;
    tooltip?: string;
    stopPropagation?: boolean;
    style?: React.CSSProperties;
}

/**
 * 星级评分组件
 * 
 * 根据传入的难度等级显示对应数量的星星，支持点击交互
 * 实心星星表示已选，空心星星表示未选
 * 
 * @param {StarRatingProps} props - 组件属性
 * @returns {JSX.Element} 星级评分组件
 * 
 * @example
 * // 基本用法 - 只显示3星难度
 * <StarRating difficulty={3} />
 * 
 * @example
 * // 带点击事件 - 用于评分选择
 * <StarRating 
 *   difficulty={3} 
 *   onClick={(newDifficulty) => console.log('选择了难度:', newDifficulty)} 
 * />
 */
const StarRating = ({ 
    difficulty, 
    onClick, 
    tooltip,
    stopPropagation = false,
    style 
}: StarRatingProps) => {
    const { t } = useTranslation();
    const isClickable = !!onClick;
    
    // 使用传入的tooltip或默认的i18n文本
    const tooltipText = tooltip || t('tagTooltips.filterByDifficulty');

    const handleClick = (e: React.MouseEvent) => {
        // 根据需要阻止事件冒泡
        if (stopPropagation) {
            e.stopPropagation();
        }
        
        // 调用外部传入的onClick回调
        if (onClick) {
            onClick(difficulty);
        }
    };

    const starTag = (
        <Tag
            className={isClickable ? 'star-rating-clickable' : ''}
            color="transparent"
            onClick={isClickable ? handleClick : undefined}
            style={{
                cursor: isClickable ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0,
                padding: '2px 6px',
                border: 'none',
                background: 'transparent',
                margin: 0,
                transition: 'transform 0.2s',
                ...style
            }}
        >
            {/* 生成5个星星，根据difficulty值决定显示实心还是空心 */}
            {[...Array(5)].map((_, index) => {
                const StarComponent = index < difficulty ? StarFilled : StarOutlined; // 根据索引和难度选择星星类型
                return (
                    <StarComponent
                        key={index}
                        className={isClickable ? 'star-icon-clickable' : ''}
                        style={{
                            color: '#ffc53d', // 星星颜色 - 金黄色
                            fontSize: '16px',
                            transition: 'color 0.2s, transform 0.1s', // 平滑颜色过渡效果
                            flexShrink: 0 // 防止星星被压缩
                        }}
                    />
                );
            })}
        </Tag>
    );
    
    return tooltipText && isClickable ? (
        <Tooltip title={tooltipText} placement="top">
            {starTag}
        </Tooltip>
    ) : starTag;
};

export default StarRating;