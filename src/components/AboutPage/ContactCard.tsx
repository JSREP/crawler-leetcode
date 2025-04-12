import * as React from 'react';
import { Card, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { GithubOutlined, StarFilled } from '@ant-design/icons';
import { cardStyle, githubIconStyle, githubLinkStyle, starTagStyle, textStyle } from './styles';

const { Text, Link } = Typography;

interface ContactCardProps {
  repoStars: number | string | null;
}

/**
 * 联系我们卡片组件
 */
const ContactCard: React.FC<ContactCardProps> = ({ repoStars }) => {
  const { t } = useTranslation();

  return (
    <Card
      title={t('about.contact.title')}
      bordered={false}
      style={cardStyle}
      hoverable
    >
      <Space direction="vertical" size={16}>
        <Text style={textStyle}>
          {t('about.contact.email')}：<Link href="mailto:contact@leetcode-crawler.com">contact@leetcode-crawler.com</Link>
        </Text>

        <Space align="center">
          <GithubOutlined style={githubIconStyle} />
          <Link
            href="https://github.com/JSREP/crawler-leetcode"
            target="_blank"
            style={githubLinkStyle}
          >
            JSREP/crawler-leetcode
          </Link>

          {repoStars !== null ? (
            <Tag
              icon={<StarFilled style={{ color: '#fff' }} />}
              style={starTagStyle}
            >
              {repoStars}
            </Tag>
          ) : (
            <Text type="secondary" style={{ marginLeft: 8 }}>{t('about.contact.loading')}</Text>
          )}
        </Space>
      </Space>
    </Card>
  );
};

export default ContactCard; 