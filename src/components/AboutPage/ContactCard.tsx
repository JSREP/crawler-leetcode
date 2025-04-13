import * as React from 'react';
import { Card, Space, Tag, Typography, Image, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { GithubOutlined, StarFilled, WechatOutlined } from '@ant-design/icons';
import { cardStyle, githubIconStyle, githubLinkStyle, starTagStyle, textStyle } from './styles';
import wechatQrcode from '../../assets/CC11001100-wechat-qrcode.png';

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
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Text style={textStyle}>
          {t('about.contact.email')}：<Link href="mailto:CC11001100@qq.com">CC11001100@qq.com</Link>
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
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Space align="center">
            <WechatOutlined style={{ fontSize: '20px', color: '#42b983' }} />
            <Text style={{ ...textStyle, fontWeight: 'bold' }}>扫码加微信，拉你进逆向技术讨论群</Text>
          </Space>
          <Text type="secondary" style={{ textAlign: 'center', marginBottom: '10px' }}>加好友时请备注【逆向】，方便我知道你是从这里来的～</Text>
          <Image 
            src={wechatQrcode} 
            alt="微信二维码" 
            width={200} 
            style={{ margin: '10px 0' }}
            fallback="https://via.placeholder.com/200x200?text=微信二维码"
          />
        </Space>
      </Space>
    </Card>
  );
};

export default ContactCard; 