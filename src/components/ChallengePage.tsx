import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, Input, List, Pagination, Select, Space, Tag, Typography, message,
} from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, StarFilled, ShareAltOutlined } from '@ant-design/icons';

export type Solution = {
  title: string;
  url: string;
  source: string;
};

export type Challenge = {
  id: number;
  number: number;
  title: string;
  description: string;
  difficulty: number;
  tags: string[];
  solutions: Solution[];
  createTime: Date;
  updateTime: Date;
};

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const generateMockData = (count: number): Challenge[] => {
  const tagsPool = ['JavaScript', 'React', 'WebSocket', '算法', '逆向', '网络', 'Node.js', 'TypeScript'];
  const sources = ['LeetCode官方', '社区贡献', 'GitHub精选', '个人博客'];

  return Array.from({ length: count }, (_, i) => {
    const baseDate = new Date();
    const createDate = new Date(baseDate.setMonth(baseDate.getMonth() - Math.random() * 24));
    const updateDate = new Date(createDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

    return {
      id: i + 1,
      number: i + 1,
      title: `编程挑战题目 #${i + 1}`,
      description: `这是用于测试分页功能的第${i + 1}个题目，包含多种算法场景的模拟数据。通过这个题目可以练习数据结构和网络协议相关技能。`,
      difficulty: Math.floor(Math.random() * 3) + 1,
      tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
          tagsPool[Math.floor(Math.random() * tagsPool.length)]
      ),
      solutions: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        title: `解决方案 ${j + 1}`,
        url: `<url id="cv1cjqvpma9i7s5ab6t0" type="url" status="failed" title="" wc="0">https://example.com/solution/</url> ${i}-${j}`,
        source: sources[Math.floor(Math.random() * sources.length)]
      })),
      createTime: createDate,
      updateTime: Math.random() > 0.5 ? updateDate : createDate
    };
  });
};

export const challenges: Challenge[] = generateMockData(500);

const ChallengePage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: [] as string[],
  });
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    challenges.forEach(challenge => challenge.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, []);

  const filteredChallenges = useMemo(() => {
    return challenges
        .filter(challenge => {
          const matchesSearch = [challenge.title, challenge.description]
              .some(text => text.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesDifficulty = filters.difficulty === 'all' ||
              challenge.difficulty === parseInt(filters.difficulty);

          const matchesTags = filters.tags.length === 0 ||
              filters.tags.every(tag => challenge.tags.includes(tag));

          return matchesSearch && matchesDifficulty && matchesTags;
        })
        .sort((a, b) => {
          const orderModifier = sortOrder === 'asc' ? 1 : -1;
          switch (sortBy) {
            case 'number': return (a.number - b.number) * orderModifier;
            case 'difficulty': return (a.difficulty - b.difficulty) * orderModifier;
            case 'createTime': return (a.createTime.getTime() - b.createTime.getTime()) * orderModifier;
            case 'updateTime': return (a.updateTime.getTime() - b.updateTime.getTime()) * orderModifier;
            default: return 0;
          }
        });
  }, [filters, searchQuery, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredChallenges.slice(start, start + pagination.pageSize);
  }, [filteredChallenges, pagination]);

  const handleShare = (challenge: Challenge) => {
    const shareText = `【${challenge.title}】\n 🌟学习地址: ${window.location.origin}/challenge/${challenge.id}`;
    navigator.clipboard
        .writeText(shareText)
        .then(() => {
          message.success('已复制到剪切板');
        })
        .catch(() => {
          message.error('复制失败，请重试');
        });
  };

  return (
      <div style={{ padding: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Select
                mode="multiple"
                placeholder={t('challenges.filters.tags')}
                style={{ width: 200 }}
                onChange={tags => setFilters(prev => ({ ...prev, tags }))}
                options={allTags.map(tag => ({ label: tag, value: tag }))}
            />

            <Select
                placeholder={t('challenges.filters.difficulty')}
                style={{ width: 120 }}
                value={filters.difficulty}
                onChange={difficulty => setFilters(prev => ({ ...prev, difficulty }))}
            >
              <Option value="all">{t('challenges.filters.allDifficulties')}</Option>
              <Option value="1">★</Option>
              <Option value="2">★★</Option>
              <Option value="3">★★★</Option>
            </Select>

            <Select
                value={sortBy}
                style={{ width: 120 }}
                onChange={value => setSortBy(value)}
            >
              <Option value="number">{t('challenges.sort.number')}</Option>
              <Option value="difficulty">{t('challenges.sort.difficulty')}</Option>
              <Option value="createTime">{t('challenges.sort.createTime')}</Option>
              <Option value="updateTime">{t('challenges.sort.updateTime')}</Option>
            </Select>

            <Button
                icon={sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            />

            <Search
                placeholder={t('challenges.filters.search')}
                allowClear
                style={{ width: 200 }}
                onSearch={value => setSearchQuery(value)}
            />
          </Space>

          <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={paginatedData}
              renderItem={challenge => (
                  <List.Item>
                    <Card
                        hoverable
                        onClick={() => navigate(`/challenge/${challenge.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color="#42b983">{challenge.number}</Tag>
                          <Text strong style={{ fontSize: 16 }}>{challenge.title}</Text>
                        </Space>

                        <Text type="secondary">{challenge.description}</Text>

                        <Space wrap>
                          <Tag icon={<StarFilled />} color="gold">
                            {'★'.repeat(challenge.difficulty)}
                          </Tag>
                          {challenge.tags.map(tag => (
                              <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                          <Text type="secondary">
                            {t('challenges.dates.created')}: {challenge.createTime.toLocaleDateString()}
                          </Text>
                          <Text type="secondary">
                            {t('challenges.dates.updated')}: {challenge.updateTime.toLocaleDateString()}
                          </Text>
                          <Button
                              size="small"
                              icon={<ShareAltOutlined />}
                              onClick={() => handleShare(challenge)}
                              title="点击复制分享内容"
                          />
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
              )}
          />

          <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={filteredChallenges.length}
              showSizeChanger
              onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
              style={{ marginTop: 24, textAlign: 'center' }}
          />
        </Space>
      </div>
  );
};

export default ChallengePage;