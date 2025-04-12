// src/components/AboutPage.tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { GithubOutlined, StarFilled } from '@ant-design/icons'

const { Title, Text, Link } = Typography;

const AboutPage = () => {
  const { t } = useTranslation();
  const [repoStars, setRepoStars] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchRepoStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/JSREP/crawler-leetcode');
        if (response.ok) {
          const data = await response.json();
          setRepoStars(data.stargazers_count);
        } else {
          console.error(`Failed to fetch: ${response.status}`);
          setRepoStars('获取失败');
        }
      } catch (error) {
        console.error('Error:', error);
        setRepoStars('获取失败');
      }
    };
    fetchRepoStars();
  }, []);

  return (
    <div style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 48 }}>
        {t('about.title')}
        <div style={{
          height: 4,
          background: 'linear-gradient(to right, #42b983, #3eaf7c)',
          width: 100,
          margin: '10px auto 0'
        }} />
      </Title>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* 关于爬虫LeetCode */}
        <Card
          title={t('about.title')}
          bordered={false}
          style={{ 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
            transition: 'all 0.3s',
            marginBottom: 32
          }}
          hoverable
        >
          <Text style={{ 
            color: '#4a5568', 
            lineHeight: 1.8,
            fontSize: '16px',
            display: 'block'
          }}>
            {t('about.description')}
          </Text>
        </Card>

        {/* 联系我们 */}
        <Card
          title={t('about.contact.title')}
          bordered={false}
          style={{ 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
            transition: 'all 0.3s',
            marginBottom: 32
          }}
          hoverable
        >
          <Space direction="vertical" size={16}>
            <Text style={{ color: '#4a5568', fontSize: '16px' }}>
              {t('about.contact.email')}：<Link href="mailto:contact@leetcode-crawler.com">contact@leetcode-crawler.com</Link>
            </Text>

            <Space align="center">
              <GithubOutlined style={{ color: '#4a5568', fontSize: '18px' }} />
              <Link
                href="https://github.com/JSREP/crawler-leetcode"
                target="_blank"
                style={{ color: '#42b983', fontSize: '16px' }}
              >
                JSREP/crawler-leetcode
              </Link>

              {repoStars !== null ? (
                <Tag
                  icon={<StarFilled style={{ color: '#fff' }} />}
                  style={{
                    background: '#42b983',
                    color: '#fff',
                    borderRadius: 20,
                    marginLeft: 8
                  }}
                >
                  {repoStars}
                </Tag>
              ) : (
                <Text type="secondary" style={{ marginLeft: 8 }}>{t('about.contact.loading')}</Text>
              )}
            </Space>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;