import { Tag } from 'antd';

interface TagsProps {
    tags: string[];
    selectedTags?: string[];
    onTagClick?: (tag: string) => void;
}

const Tags = ({ tags, selectedTags = [], onTagClick }: TagsProps) => {
    return (
        <>
            {tags.map(tag => (
                <Tag
                    key={tag}
                    color={selectedTags.includes(tag) ? 'geekblue' : 'blue'}
                    onClick={() => onTagClick?.(tag)}
                    style={{
                        cursor: onTagClick ? 'pointer' : 'default',
                        margin: '2px 4px'
                    }}
                >
                    {tag}
                </Tag>
            ))}
        </>
    );
};

export default Tags;