import * as React from 'react';
import { Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Challenge } from '../../types/challenge';

interface ChallengePaginationProps {
    /**
     * 前一个挑战
     */
    prevChallenge: Challenge | null;
    
    /**
     * 下一个挑战
     */
    nextChallenge: Challenge | null;
    
    /**
     * 点击前一个挑战的回调
     */
    onPrevClick: () => void;
    
    /**
     * 点击下一个挑战的回调
     */
    onNextClick: () => void;
}

/**
 * 挑战详情页翻页组件
 * 提供上一题/下一题导航，并显示键盘快捷键提示
 */
const ChallengePagination: React.FC<ChallengePaginationProps> = ({
    prevChallenge,
    nextChallenge,
    onPrevClick,
    onNextClick
}) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
            <Tooltip title="键盘左方向键 ←">
                <Button 
                    type="default" 
                    icon={<LeftOutlined />} 
                    onClick={onPrevClick} 
                    disabled={!prevChallenge}
                >
                    上一题 <span style={{ fontSize: '12px', opacity: 0.8 }}>(←)</span>
                </Button>
            </Tooltip>
            
            <Tooltip title="键盘右方向键 →">
                <Button 
                    type="default" 
                    icon={<RightOutlined />} 
                    onClick={onNextClick} 
                    disabled={!nextChallenge}
                >
                    下一题 <span style={{ fontSize: '12px', opacity: 0.8 }}>(→)</span>
                </Button>
            </Tooltip>
        </div>
    );
};

export default ChallengePagination; 