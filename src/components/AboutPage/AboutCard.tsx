import * as React from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { cardStyle, textStyle } from './styles';

const { Text } = Typography;

/**
 * 关于爬虫LeetCode的描述卡片组件
 */
const AboutCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card
      title={t('about.title')}
      bordered={false}
      style={cardStyle}
      hoverable
    >
      <Text style={textStyle}>
        {t('about.description')}
      </Text>
    </Card>
  );
};

export default AboutCard; 