import { Space, Typography, Badge, Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Challenge } from '../../types/challenge';
import IdTag from '../IdTag';
import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ChallengeHeaderProps {
    challenge: Challenge;
}

/**
 * 挑战详情页的标题头部组件
 */
const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ challenge }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    
    // 处理ID点击，可以跳转到列表页
    const handleIdClick = () => {
        navigate('/challenges');
    };
    
    // 跳转到GitHub对应的YAML文件
    const handleCorrectClick = () => {
        if (challenge.sourceFile) {
            const githubBaseUrl = 'https://github.com/JSREP/crawler-leetcode/blob/main/';
            const fileUrl = `${githubBaseUrl}${challenge.sourceFile}`;
            window.open(fileUrl, '_blank');
        }
    };
    
    // 跳转到GitHub提交issue
    const handleIssueClick = () => {
        const githubIssueUrl = 'https://github.com/JSREP/crawler-leetcode/issues/new';
        
        let title, body;
        
        // 根据当前语言决定使用英文还是中文模板
        if (i18n.language === 'en') {
            // 英文模板
            title = encodeURIComponent(`Issue Report: ${challenge.titleEN || challenge.name_en || challenge.title} (ID: ${challenge.id})`);
            body = encodeURIComponent(
                `## Issue Description\n\nPlease describe the issue you encountered\n\n` +
                `## Challenge Information\n\n` +
                `- Challenge ID: ${challenge.id}\n` +
                `- Challenge Title: ${challenge.titleEN || challenge.name_en || challenge.title}\n` +
                `- Source File: ${challenge.sourceFile || 'Unknown'}\n\n` +
                `## Additional Information\n\n` +
                `Please provide any other details that might help resolve this issue`
            );
        } else {
            // 中文模板
            title = encodeURIComponent(`问题反馈: ${challenge.title || challenge.name} (ID: ${challenge.id})`);
            body = encodeURIComponent(
                `## 问题描述\n\n请描述你遇到的问题\n\n` +
                `## 挑战信息\n\n` +
                `- 挑战ID: ${challenge.id}\n` +
                `- 挑战标题: ${challenge.title || challenge.name}\n` +
                `- 挑战源文件: ${challenge.sourceFile || '未知'}\n\n` +
                `## 其他信息\n\n` +
                `请提供其他有助于解决问题的信息`
            );
        }
        
        window.open(`${githubIssueUrl}?title=${title}&body=${body}`, '_blank');
    };
    
    // 确保id是一个有效值
    const displayId = challenge.id !== undefined ? challenge.id : '?';
    
    // 根据当前语言选择显示标题
    const displayTitle = i18n.language === 'en' && (challenge.titleEN || challenge.name_en) 
        ? (challenge.titleEN || challenge.name_en) 
        : (challenge.title || challenge.name);
    
    // 添加调试信息
    console.log('ChallengeHeader - 当前语言:', i18n.language);
    console.log('ChallengeHeader - 挑战对象:', challenge);
    console.log('ChallengeHeader - 标题字段:', {
        title: challenge.title,
        name: challenge.name,
        titleEN: challenge.titleEN,
        name_en: challenge.name_en,
        finalDisplayTitle: displayTitle
    });
    
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <Space align="center">
                <IdTag 
                    id={displayId}
                    clickable
                    onClick={handleIdClick}
                />
                <Title level={2} style={{ margin: 0 }}>{displayTitle}</Title>
                {challenge.isExpired && (
                    <Badge status="error" text={t('challenge.expired.linkStatus')} />
                )}
            </Space>
            
            <Space>
                {challenge.sourceFile && (
                    <Tooltip title={t('challenge.detail.correctionTooltip')}>
                        <Button 
                            type="link" 
                            icon={<GithubOutlined />} 
                            onClick={handleCorrectClick}
                            size="small"
                        >
                            {t('challenge.detail.correction')}
                        </Button>
                    </Tooltip>
                )}
                
                <Tooltip title={t('challenge.detail.issueTooltip')}>
                    <Button
                        type="link"
                        icon={<QuestionCircleOutlined />}
                        onClick={handleIssueClick}
                        size="small"
                    >
                        {t('challenge.detail.reportIssue')}
                    </Button>
                </Tooltip>
            </Space>
        </div>
    );
};

export default ChallengeHeader;