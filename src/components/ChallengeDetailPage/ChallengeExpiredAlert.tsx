import * as React from 'react';
import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    
    if (!isExpired) {
        return null;
    }
    
    return (
        <Alert
            message={t('challenge.expired.title')}
            description={t('challenge.expired.description')}
            type="error"
            showIcon
            banner
            style={{ marginBottom: '20px' }}
        />
    );
};

export default ChallengeExpiredAlert; 