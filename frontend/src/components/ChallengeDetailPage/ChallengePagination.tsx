import * as React from 'react';
import { Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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

    /**
     * 是否为移动端视图
     */
    isMobile?: boolean;
}

/**
 * 挑战详情页翻页组件
 * 提供上一题/下一题导航，并显示键盘快捷键提示
 */
const ChallengePagination: React.FC<ChallengePaginationProps> = ({
    prevChallenge,
    nextChallenge,
    onPrevClick,
    onNextClick,
    isMobile = false
}) => {
    const { t } = useTranslation();
    
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            margin: isMobile ? '12px 0' : '20px 0',
            flexWrap: 'wrap',
            gap: isMobile ? '8px' : '0'
        }}>
            <Tooltip title={t('challenge.pagination.leftKeyHint')}>
                <Button 
                    type="default" 
                    icon={<LeftOutlined />} 
                    onClick={onPrevClick} 
                    disabled={!prevChallenge}
                    size={isMobile ? "middle" : "default"}
                    style={{ 
                        minWidth: isMobile ? '100px' : '140px',
                        flex: isMobile ? 1 : 'initial'
                    }}
                >
                    {isMobile ? '' : `${t('challenge.pagination.previous')} `}<span style={{ fontSize: '12px', opacity: 0.8 }}>(←)</span>
                </Button>
            </Tooltip>
            
            <Tooltip title={t('challenge.pagination.rightKeyHint')}>
                <Button 
                    type="default" 
                    icon={<RightOutlined />} 
                    onClick={onNextClick} 
                    disabled={!nextChallenge}
                    size={isMobile ? "middle" : "default"}
                    style={{ 
                        minWidth: isMobile ? '100px' : '140px',
                        flex: isMobile ? 1 : 'initial'
                    }}
                >
                    {isMobile ? '' : `${t('challenge.pagination.next')} `}<span style={{ fontSize: '12px', opacity: 0.8 }}>(→)</span>
                </Button>
            </Tooltip>
        </div>
    );
};

export default ChallengePagination; 