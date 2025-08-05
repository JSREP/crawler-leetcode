'use client';

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Spin,
  message,
  Empty
} from 'antd';
import {
  ReloadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { Challenge } from '@/types/challenge';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // 获取挑战数据
  const fetchChallenges = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/db/challenges?page=1&per_page=20');

      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }

      const data = await response.json();
      setChallenges(data.challenges || []);
      setTotal(data.total || 0);

    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      message.error('加载挑战数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchChallenges();
  }, []);

  // 刷新数据
  const handleRefresh = () => {
    fetchChallenges();
    message.success('数据已刷新');
  };

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* 挑战列表 */}
      {loading ? (
        <div className="text-center py-20">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">
            正在加载挑战数据...
          </div>
        </div>
      ) : challenges.length > 0 ? (
        <Row gutter={[16, 16]}>
          {challenges.map((challenge) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={challenge.id}>
              <Card
                className="h-full"
                actions={[
                  <Link key="view" href={`/challenges/${challenge.id_alias}`}>
                    <Button type="primary" icon={<LinkOutlined />} block>
                      查看详情
                    </Button>
                  </Link>
                ]}
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {challenge.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    难度: {challenge.difficulty_level}/5
                  </p>
                  <p className="text-sm text-gray-500">
                    平台: {challenge.platform}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="暂无挑战数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
}
