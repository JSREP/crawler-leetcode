'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Tag,
  Pagination,
  Spin,
  message,
  Empty
} from 'antd';
import {
  ReloadOutlined,
  StarFilled,
  LinkOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { Challenge, ChallengeFilters, DIFFICULTY_LEVELS, PLATFORMS } from '@/types/challenge';
import { formatRelativeTime, cn } from '@/lib/utils';

const { Search } = Input;
const { Option } = Select;

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [filters, setFilters] = useState<ChallengeFilters>({
    difficulty: '',
    tags: [],
    platform: 'all',
    search: ''
  });

  // 获取挑战数据
  const fetchChallenges = useCallback(async (page: number = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pageSize.toString(),
      });
      
      if (currentFilters.platform && currentFilters.platform !== 'all') {
        params.append('platform', currentFilters.platform);
      }
      
      if (currentFilters.difficulty) {
        params.append('difficulty', currentFilters.difficulty);
      }

      if (currentFilters.tags && currentFilters.tags.length > 0) {
        params.append('tag', currentFilters.tags[0]);
      }

      if (currentFilters.search) {
        params.append('query', currentFilters.search);
      }
      
      const response = await fetch(`/api/db/challenges?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }
      
      const data = await response.json();
      setChallenges(data.challenges);
      setTotal(data.total);
      
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      message.error('加载挑战数据失败');
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  // 初始加载
  useEffect(() => {
    fetchChallenges(1);
  }, [fetchChallenges]);

  // 处理搜索
  const handleSearch = (value: string) => {
    const newFilters = { ...filters, query: value };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchChallenges(1, newFilters);
  };

  // 处理筛选
  const handleFilterChange = (key: keyof ChallengeFilters, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchChallenges(1, newFilters);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchChallenges(page);
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchChallenges(currentPage);
    message.success('数据已刷新');
  };

  // 渲染难度星级
  const renderDifficultyStars = (level: number) => {
    const difficultyInfo = DIFFICULTY_LEVELS[level as keyof typeof DIFFICULTY_LEVELS];
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <StarFilled
            key={index}
            className={cn(
              'text-sm',
              index < level ? 'text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {difficultyInfo.label}
        </span>
      </div>
    );
  };

  // 渲染挑战卡片
  const renderChallengeCard = (challenge: Challenge) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={challenge.id}>
      <Card
        className="h-full card-hover"
        actions={[
          <Link key="view" href={`/challenges/${challenge.id_alias}`}>
            <Button type="primary" icon={<LinkOutlined />} block>
              查看详情
            </Button>
          </Link>
        ]}
      >
        <div className="space-y-3">
          {/* 标题 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 text-ellipsis-2">
              {challenge.name}
            </h3>
            {challenge.name_en && (
              <p className="text-sm text-gray-500 text-ellipsis-2">
                {challenge.name_en}
              </p>
            )}
          </div>

          {/* 难度 */}
          <div>
            {renderDifficultyStars(challenge.difficulty_level)}
          </div>

          {/* 平台 */}
          <div>
            <Tag color="blue">{challenge.platform}</Tag>
            {challenge.is_expired && (
              <Tag color="red">已过期</Tag>
            )}
          </div>

          {/* 标签 */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {challenge.tags.slice(0, 3).map(tag => (
                  <Tag
                    key={tag}
                    className="cursor-pointer text-xs"
                    onClick={() => handleFilterChange('tags', [tag])}
                  >
                    {tag}
                  </Tag>
                ))}
                {challenge.tags.length > 3 && (
                  <Tag color="default" className="text-xs">
                    +{challenge.tags.length - 3}
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* 时间 */}
          <div className="text-xs text-gray-500">
            更新于 {formatRelativeTime(challenge.updated_at)}
          </div>
        </div>
      </Card>
    </Col>
  );

  return (
    <div className="container-responsive py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            挑战列表
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({loading ? '...' : total})
            </span>
          </h1>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
        </div>
        
        <p className="text-gray-600">
          探索各种爬虫技术挑战，提升你的数据采集技能
        </p>
      </div>

      {/* 筛选器 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索挑战..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="平台"
              style={{ width: '100%' }}
              value={filters.platform}
              onChange={(value) => handleFilterChange('platform', value)}
            >
              <Option value="all">全部平台</Option>
              {Object.entries(PLATFORMS).map(([key, info]) => (
                <Option key={key} value={key}>
                  {info.label}
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="难度"
              style={{ width: '100%' }}
              value={filters.difficulty}
              onChange={(value) => handleFilterChange('difficulty', value || '')}
              allowClear
            >
              {Object.entries(DIFFICULTY_LEVELS).map(([level, info]) => (
                <Option key={level} value={level}>
                  {info.icon} {info.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 挑战列表 */}
      {loading ? (
        <div className="text-center py-20">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">
            正在加载挑战数据...
          </div>
        </div>
      ) : challenges.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {challenges.map(renderChallengeCard)}
          </Row>
          
          {/* 分页 */}
          {total > pageSize && (
            <div className="mt-8 text-center">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `第 ${range[0]}-${range[1]} 项，共 ${total} 项`
                }
              />
            </div>
          )}
        </>
      ) : (
        <Empty
          description="暂无挑战数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
}
