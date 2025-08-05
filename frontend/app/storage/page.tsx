'use client';

import React, { useState, useEffect } from 'react';
import { Card, Progress, Button, Table, Tag, Space, Modal, Input, message, Statistic, Row, Col } from 'antd';
import { CloudOutlined, DeleteOutlined, ShoppingOutlined, FileOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatBalance } from '@/lib/wallet/utils';

interface StorageStats {
  total_files: number;
  total_size: number;
  used_quota: number;
  total_quota: number;
  available_quota: number;
  usage_percentage: number;
  files_by_type: Array<{
    file_type: string;
    count: number;
    total_size: number;
  }>;
  files_by_purpose: Array<{
    upload_purpose: string;
    count: number;
    total_size: number;
  }>;
}

interface UserFile {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  blob_url: string;
  upload_purpose: string;
  created_at: string;
}

const StoragePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseSize, setPurchaseSize] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 加载存储统计
  const loadStats = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/storage?action=stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Load storage stats error:', error);
    }
  };

  // 加载文件列表
  const loadFiles = async (page: number = 1) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/storage?action=files&page=${page}&per_page=20`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setTotal(data.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Load files error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除文件
  const deleteFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/storage?file_id=${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('文件删除成功');
        loadFiles(currentPage);
        loadStats();
      } else {
        const error = await response.json();
        message.error(error.error || '删除失败');
      }
    } catch (error) {
      console.error('Delete file error:', error);
      message.error('删除失败');
    }
  };

  // 购买存储空间
  const purchaseStorage = async () => {
    if (!purchaseSize || parseFloat(purchaseSize) <= 0) {
      message.warning('请输入有效的存储大小');
      return;
    }

    try {
      const response = await fetch('/api/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          size_mb: parseFloat(purchaseSize),
        }),
      });

      if (response.ok) {
        message.success('存储空间购买成功');
        setPurchaseModalVisible(false);
        setPurchaseSize('');
        loadStats();
      } else {
        const error = await response.json();
        message.error(error.error || '购买失败');
      }
    } catch (error) {
      console.error('Purchase storage error:', error);
      message.error('购买失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化上传用途
  const formatUploadPurpose = (purpose: string) => {
    const purposeMap: { [key: string]: { label: string; color: string } } = {
      avatar: { label: '头像', color: 'blue' },
      post_image: { label: '帖子图片', color: 'green' },
      attachment: { label: '附件', color: 'orange' },
      forum: { label: '论坛', color: 'purple' },
      general: { label: '通用', color: 'default' },
    };

    return purposeMap[purpose] || { label: purpose, color: 'default' };
  };

  // 表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      ellipsis: true,
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size: number) => formatFileSize(size),
      sorter: (a: UserFile, b: UserFile) => a.file_size - b.file_size,
    },
    {
      title: '类型',
      dataIndex: 'file_type',
      key: 'file_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '用途',
      dataIndex: 'upload_purpose',
      key: 'upload_purpose',
      render: (purpose: string) => {
        const { label, color } = formatUploadPurpose(purpose);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString(),
      sorter: (a: UserFile, b: UserFile) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: UserFile) => (
        <Space>
          <Button
            type="link"
            href={record.blob_url}
            target="_blank"
            size="small"
          >
            查看
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个文件吗？此操作不可撤销。',
                onOk: () => deleteFile(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (user) {
      loadStats();
      loadFiles();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CloudOutlined className="text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">请先登录</h2>
            <p className="text-gray-500">登录后即可查看和管理您的存储空间</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">存储管理</h1>
          <p className="text-gray-600">管理您的文件和存储空间配额</p>
        </div>

        {/* 存储统计 */}
        {stats && (
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={12} lg={8}>
              <Card>
                <Statistic
                  title="已使用空间"
                  value={formatFileSize(stats.used_quota)}
                  suffix={`/ ${formatFileSize(stats.total_quota)}`}
                />
                <Progress
                  percent={stats.usage_percentage}
                  status={stats.usage_percentage > 90 ? 'exception' : 'normal'}
                  className="mt-2"
                />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card>
                <Statistic
                  title="文件总数"
                  value={stats.total_files}
                  suffix="个"
                />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card>
                <Statistic
                  title="可用空间"
                  value={formatFileSize(stats.available_quota)}
                />
                <Button
                  type="primary"
                  icon={<ShoppingOutlined />}
                  className="mt-2"
                  onClick={() => setPurchaseModalVisible(true)}
                >
                  购买更多
                </Button>
              </Card>
            </Col>
          </Row>
        )}

        {/* 文件列表 */}
        <Card
          title={
            <Space>
              <FileOutlined />
              我的文件
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={files}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              total: total,
              pageSize: 20,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              onChange: loadFiles,
            }}
          />
        </Card>

        {/* 购买存储空间弹窗 */}
        <Modal
          title="购买存储空间"
          open={purchaseModalVisible}
          onOk={purchaseStorage}
          onCancel={() => setPurchaseModalVisible(false)}
          okText="确认购买"
          cancelText="取消"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                购买大小 (MB)
              </label>
              <Input
                value={purchaseSize}
                onChange={(e) => setPurchaseSize(e.target.value)}
                placeholder="输入要购买的存储大小"
                type="number"
                min="1"
                max="10240"
                suffix="MB"
              />
            </div>
            
            {purchaseSize && parseFloat(purchaseSize) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">💰 费用计算</div>
                  <div>
                    购买 {purchaseSize} MB 存储空间需要：
                    <span className="font-bold text-blue-600">
                      {formatBalance((BigInt(parseFloat(purchaseSize) * 10) * BigInt('1000000000000000000')).toString())} CRAWLER Coin
                    </span>
                  </div>
                  <div className="text-xs mt-1">价格：10 CRAWLER Coin / MB</div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default StoragePage;
