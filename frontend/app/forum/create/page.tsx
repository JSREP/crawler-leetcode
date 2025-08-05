/**
 * 发帖页面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  message, 
  Space,
  Typography,
  Divider,
  Alert
} from 'antd';
import { 
  SendOutlined, 
  ArrowLeftOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '@/components/editor/MarkdownEditor';

const { Title, Text } = Typography;
const { Option } = Select;

interface Challenge {
  id: number;
  name: string;
  id_alias: string;
}

export default function CreatePostPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [content, setContent] = useState('');

  // 检查认证状态
  useEffect(() => {
    // 给一些时间让认证状态加载
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        message.error('请先登录');
        router.push('/');
        return;
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // 获取挑战列表
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch('/api/challenges');
        if (response.ok) {
          const data = await response.json();
          setChallenges(data.challenges || []);
        }
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
      }
    };

    fetchChallenges();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!content.trim()) {
      message.error('请输入帖子内容');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          content: content,
          challenge_id: values.challenge_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        message.success('帖子发表成功');
        router.push(`/forum/posts/${data.post.id}`);
      } else {
        const error = await response.json();
        message.error(error.error || '发表失败');
      }
    } catch (error) {
      message.error('发表失败');
    } finally {
      setLoading(false);
    }
  };

  // 暂时跳过认证检查进行测试
  // TODO: 修复认证系统后恢复此检查
  /*
  if (isAuthenticated === false) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h2>请先登录</h2>
          <p>您需要登录后才能发表帖子</p>
        </div>
      </div>
    );
  }
  */

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/forum">
            <Button icon={<ArrowLeftOutlined />} type="text">
              返回讨论区
            </Button>
          </Link>
        </div>
        <Title level={2}>发表新帖子</Title>
        <Text type="secondary">
          分享你的经验、提出问题或讨论技术话题
        </Text>
      </div>

      {/* 发帖提示 */}
      <Alert
        message="发帖须知"
        description={
          <div className="space-y-1">
            <div>• 请确保内容与技术讨论相关</div>
            <div>• 支持Markdown格式，可以插入代码、图片等</div>
            <div>• 可以关联相关的挑战题目</div>
            <div>• 发帖将消耗100个CRAWLER代币</div>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        className="mb-6"
        showIcon
      />

      {/* 发帖表单 */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* 标题 */}
          <Form.Item
            name="title"
            label="帖子标题"
            rules={[
              { required: true, message: '请输入帖子标题' },
              { max: 255, message: '标题不能超过255个字符' }
            ]}
          >
            <Input
              placeholder="请输入一个清晰、简洁的标题"
              size="large"
              showCount
              maxLength={255}
            />
          </Form.Item>

          {/* 关联挑战 */}
          <Form.Item
            name="challenge_id"
            label="关联挑战（可选）"
            help="选择与此帖子相关的挑战题目"
          >
            <Select
              placeholder="选择相关挑战"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {challenges.map(challenge => (
                <Option key={challenge.id} value={challenge.id}>
                  {challenge.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          {/* 内容编辑器 */}
          <Form.Item
            label="帖子内容"
            required
          >
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="请输入帖子内容，支持Markdown格式..."
              height={500}
            />
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item className="mb-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <Space>
                  <span>当前代币余额: 1,000,000 CRAWLER</span>
                  <span>•</span>
                  <span>发帖消耗: 100 CRAWLER</span>
                </Space>
              </div>
              
              <Space>
                <Link href="/forum">
                  <Button>取消</Button>
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={loading}
                  size="large"
                >
                  发表帖子
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* 预览提示 */}
      <div className="mt-6 text-center">
        <Text type="secondary" className="text-sm">
          发表前请仔细检查内容，发表后可以编辑但会留下编辑记录
        </Text>
      </div>
    </div>
  );
}
