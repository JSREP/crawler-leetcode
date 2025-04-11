import { Tag } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';

interface StarRatingProps {
    difficulty: number;
    onClick?: (difficulty: number) => void;
}

const StarRating = ({ difficulty, onClick }: StarRatingProps) => {
    return (
        <Tag
            color="transparent"
            onClick={() => onClick?.(difficulty)}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0,
                padding: '2px 6px',
                border: 'none',
                background: 'transparent',
                margin: 0
            }}
        >
            {[...Array(5)].map((_, index) => {
                const StarComponent = index < difficulty ? StarFilled : StarOutlined;
                return (
                    <StarComponent
                        key={index}
                        style={{
                            color: '#ffc53d',
                            fontSize: '16px',
                            transition: 'color 0.2s',
                            flexShrink: 0
                        }}
                    />
                );
            })}
        </Tag>
    );
};

export default StarRating;