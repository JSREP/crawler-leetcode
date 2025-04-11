/**
 * 标签组件
 * 用于展示和管理标签列表，支持标签选择功能
 */
import { Tag } from 'antd';

/**
 * 标签组件的属性接口
 * 
 * @interface TagsProps
 * @property {string[]} tags - 要显示的标签数组
 * @property {string[]} [selectedTags=[]] - 已选中的标签数组，默认为空数组
 * @property {Function} [onTagClick] - 标签点击事件的处理函数，接收被点击的标签值作为参数
 */
interface TagsProps {
    tags: string[];
    selectedTags?: string[];
    onTagClick?: (tag: string) => void;
}

/**
 * 标签组件
 * 
 * 显示一组标签，可设置选中状态，支持点击交互
 * 
 * @param {TagsProps} props - 组件属性
 * @returns {JSX.Element} 标签组件
 * 
 * @example
 * // 基本用法
 * <Tags tags={['React', 'TypeScript', 'Ant Design']} />
 * 
 * @example
 * // 带选中状态和点击事件
 * <Tags 
 *   tags={['React', 'TypeScript', 'Ant Design']}
 *   selectedTags={['React']}
 *   onTagClick={(tag) => console.log('点击了标签:', tag)}
 * />
 */
const Tags = ({ tags, selectedTags = [], onTagClick }: TagsProps) => {
    return (
        <>
            {tags.map(tag => (
                <Tag
                    key={tag}
                    color={selectedTags.includes(tag) ? 'geekblue' : 'blue'} // 根据是否选中显示不同颜色
                    onClick={() => onTagClick?.(tag)} // 可选的点击处理函数
                    style={{
                        cursor: onTagClick ? 'pointer' : 'default', // 有点击事件时显示指针样式
                        margin: '2px 4px' // 标签间距
                    }}
                >
                    {tag}
                </Tag>
            ))}
        </>
    );
};

export default Tags;