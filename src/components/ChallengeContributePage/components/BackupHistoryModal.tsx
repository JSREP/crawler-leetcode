import * as React from 'react';
import { Modal, List, Button, Space, Empty, Typography, Divider } from 'antd';
import { ReloadOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface BackupHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  backupOptions: { label: string; value: string }[];
  onRecover: (timestamp: string) => void;
}

/**
 * 备份历史模态框组件
 * 用于显示和恢复历史备份
 */
const BackupHistoryModal: React.FC<BackupHistoryModalProps> = ({
  visible,
  onClose,
  backupOptions,
  onRecover
}) => {
  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>备份历史</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={600}
    >
      {backupOptions.length === 0 ? (
        <Empty description="没有找到可用的备份历史" />
      ) : (
        <>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            您可以恢复以下任一备份。点击"恢复"按钮将用所选备份替换当前表单数据。
          </Text>
          
          <Divider />
          
          <List
            itemLayout="horizontal"
            dataSource={backupOptions}
            renderItem={item => (
              <List.Item
                key={item.value}
                actions={[
                  <Button 
                    key="recover" 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={() => onRecover(item.value)}
                  >
                    恢复
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<HistoryOutlined style={{ fontSize: 24 }} />}
                  title={<Title level={5}>备份时间: {item.label}</Title>}
                  description="点击恢复按钮将用此备份替换当前表单数据。此操作不可撤销。"
                />
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
};

export default BackupHistoryModal; 