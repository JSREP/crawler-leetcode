import * as React from 'react';
import { Alert } from 'antd';

interface ChallengeExpiredAlertProps {
    /**
     * 是否显示失效警告
     */
    isExpired?: boolean;
}

/**
 * 挑战题目链接失效警告组件
 * 当题目链接已失效时显示警告横幅
 */
const ChallengeExpiredAlert: React.FC<ChallengeExpiredAlertProps> = ({ isExpired = false }) => {
    if (!isExpired) {
        return null;
    }
    
    return (
        <Alert
            message="警告：此挑战题目链接已失效"
            description="该链接可能已经被移除或已更改。请尝试搜索最新版本或联系管理员更新此题目。"
            type="error"
            showIcon
            banner
            style={{ marginBottom: '20px' }}
        />
    );
};

export default ChallengeExpiredAlert; 