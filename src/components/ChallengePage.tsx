// src/components/ChallengePage.tsx
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, Input, List, Pagination, Select, Space, Tag, Typography
} from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, StarFilled } from '@ant-design/icons';

type Solution = {
  title: string;
  url: string;
  source: string;
};

type Challenge = {
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

const ChallengePage = () => {
  const { t } = useTranslation(); // 修复点1：正确获取翻译函数
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: [] as string[],
  });
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();

  // 示例数据
  const challenges: Challenge[] = [
    {
      id: 1,
      number: 1,
      title: '两数之和',
      description: '给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。',
      difficulty: 1,
      tags: ['JavaScript-Reverse', 'WebSocket'],
      solutions: [
        { title: '哈希表解法', url: 'https://example.com/solution1', source: 'LeetCode官方' },
        { title: '暴力解法', url: 'https://example.com/solution2', source: '社区贡献' }
      ],
      createTime: new Date('2020-01-01'),
      updateTime: new Date('2021-03-15')
    },
    // 更多数据...
  ];

  // 所有可用标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    challenges.forEach(challenge => challenge.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, []);

  // 过滤和排序后的挑战列表
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

  // 分页后的数据
  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredChallenges.slice(start, start + pagination.pageSize);
  }, [filteredChallenges, pagination]);

  return (
      <div style={{ padding: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 过滤控制区 */}
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

          {/* 挑战列表 */}
          <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={paginatedData}
              renderItem={challenge => (
                  <List.Item>
                    <Card
                        hoverable
                        onClick={() => navigate(`/challenge/${challenge.id}`)}
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
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
              )}
          />

          {/* 分页控制 */}
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