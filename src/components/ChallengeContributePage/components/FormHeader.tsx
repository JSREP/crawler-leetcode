import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { Alert, Button, Space, Tooltip, Modal, Badge, Popconfirm, Row, Col } from 'antd';
import { 
  SyncOutlined, 
  CheckCircleOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  QuestionCircleOutlined,
  HistoryOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { styles } from '../styles';

interface FormHeaderProps {
  clearSavedData: () => boolean;
  isFormDirty: boolean;
  lastSavedTime?: string;
  onManualSave?: () => void; // 新增：手动保存回调
  onShowBackups?: () => void; // 新增：显示备份历史回调
}

/**
 * 表单头部组件，显示提示信息、保存状态和清除数据按钮
 */
const FormHeader: React.FC<FormHeaderProps> = memo(({ 
  clearSavedData, 
  isFormDirty, 
  lastSavedTime,
  onManualSave,
  onShowBackups
}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState<boolean>(false);

  // 监听表单值更新事件，显示保存状态
  useEffect(() => {
    const handleFormValueUpdated = () => {
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setShowSavedIndicator(true);
        
        // 3秒后隐藏保存成功标志
        setTimeout(() => {
          setShowSavedIndicator(false);
        }, 3000);
      }, 300);
    };

    window.addEventListener('form-value-updated', handleFormValueUpdated);
    return () => {
      window.removeEventListener('form-value-updated', handleFormValueUpdated);
    };
  }, []);

  // 确认清除数据
  const handleClearData = useCallback(() => {
    Modal.confirm({
      title: '确认清除所有数据?',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清除所有已保存的表单数据，且无法恢复。如需保留数据，请考虑使用"备份历史"功能。',
      okText: '确认清除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        const success = clearSavedData();
        if (success) {
          Modal.success({
            title: '数据已清除',
            content: '所有保存的数据已成功清除，表单已重置为默认状态。'
          });
        }
      }
    });
  }, [clearSavedData]);
  
  // 手动保存处理
  const handleManualSave = useCallback(() => {
    if (onManualSave) {
      onManualSave();
    }
  }, [onManualSave]);
  
  // 显示备份历史
  const handleShowBackups = useCallback(() => {
    if (onShowBackups) {
      onShowBackups();
    }
  }, [onShowBackups]);

  // 渲染保存状态图标
  const renderSaveStatus = () => {
    if (saving) {
      return <SyncOutlined spin style={{ color: '#1890ff' }} />;
    }
    
    if (showSavedIndicator) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
    
    return isFormDirty ? 
      <Badge status="processing" text="有未保存的更改" /> : 
      <Badge status="success" text={lastSavedTime ? `上次保存: ${lastSavedTime}` : '所有更改已保存'} />;
  };

  return (
    <div className="form-header-container" style={{ marginBottom: 24 }}>
      <Alert
        message={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>表单指南</span>
            <Space size="middle" align="center">
              {renderSaveStatus()}
              
              {/* 操作按钮组 */}
              <Space>
                {/* 手动保存按钮 */}
                {onManualSave && (
                  <Tooltip title="手动保存当前表单数据">
                    <Button 
                      size="small" 
                      type="primary"
                      ghost
                      icon={<SaveOutlined />} 
                      onClick={handleManualSave}
                    >
                      保存
                    </Button>
                  </Tooltip>
                )}
                
                {/* 备份历史按钮 */}
                {onShowBackups && (
                  <Tooltip title="查看和恢复备份历史">
                    <Button 
                      size="small"
                      icon={<HistoryOutlined />} 
                      onClick={handleShowBackups}
                    >
                      备份历史
                    </Button>
                  </Tooltip>
                )}
                
                {/* 清除数据按钮 */}
                <Tooltip title="清除所有已保存的数据并重置表单">
                  <Button 
                    size="small" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={handleClearData}
                  >
                    清除数据
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </div>
        }
        description={
          <div>
            <p>请填写完整的挑战信息，以便其他用户理解和解决此挑战。所有标记为必填的字段<Badge status="error" text="*" />都必须填写。</p>
            <p>表单数据会<b>自动保存</b>到浏览器本地存储，刷新页面后可以继续编辑。每次修改都会创建备份，可通过<b>备份历史</b>按钮查看和恢复。</p>
            <p style={{ fontSize: '12px', color: '#888' }}>提示: 可以通过顶部的【导入YAML】按钮导入现有挑战数据进行编辑</p>
          </div>
        }
        type="info"
        showIcon
        style={{ ...styles.alert, marginBottom: 0 }}
      />
    </div>
  );
});

export default FormHeader; 