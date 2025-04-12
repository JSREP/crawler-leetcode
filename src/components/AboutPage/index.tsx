import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import AboutCard from './AboutCard';
import ContactCard from './ContactCard';
import { containerStyle, contentStyle, titleDividerStyle, titleStyle } from './styles';

const { Title } = Typography;

/**
 * 关于页面组件
 * 包含"关于爬虫LeetCode"和"联系我们"两个部分
 */
const AboutPage = () => {
  const { t } = useTranslation();
  const [repoStars, setRepoStars] = useState<number | string | null>(null);

  // 获取GitHub仓库star数量
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
    <div style={containerStyle}>
      <Title level={2} style={titleStyle}>
        {t('about.title')}
        <div style={titleDividerStyle} />
      </Title>

      <div style={contentStyle}>
        {/* 关于爬虫LeetCode */}
        <AboutCard />

        {/* 联系我们 */}
        <ContactCard repoStars={repoStars} />
      </div>
    </div>
  );
};

export default AboutPage; 