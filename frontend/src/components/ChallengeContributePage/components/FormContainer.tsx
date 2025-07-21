import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Dropdown, Button, Menu, message } from 'antd';
import { DownOutlined, HistoryOutlined, SaveOutlined } from '@ant-design/icons';
import { ChallengeFormData } from '../types';

// 导入钩子函数
import { 
  useFormPersistence, 
  useYamlGeneration, 
  useYamlImport,
  useFormStyles
} from '../hooks';

interface FormContainerProps {
  children: (props: {
    form: any;
    handlers: {
      handleTagsChange: (tags: string[]) => void;
      handleSolutionsChange: (solutions: any[]) => void;
      handleImportYaml: (content: string) => void;
      clearSavedData: () => boolean;
      generateYaml: () => void;
      handleCopyYaml: () => void;
      handleFormValueChange: (changedValues: any, allValues: any) => void;
      saveFormData: () => boolean;
      manualSaveFormData: () => void;
      showBackupHistory: () => void; // 新增：显示备份历史方法
    };
    state: {
      yamlOutput: string;
      initialFormValues: ChallengeFormData;
      isFormDirty: boolean;
      lastSavedTime: string;
      isSaving: boolean;
      backupOptions: { label: string; value: string }[]; // 新增：备份选项
    };
  }) => React.ReactNode;
}

/**
 * 表单容器组件 - 负责管理所有表单逻辑
 */
const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  // 表单实例
  const [form] = Form.useForm<ChallengeFormData>();
  
  // 应用表单样式
  useFormStyles();
  
  // 使用表单持久化钩子
  const { 
    initialFormValues, 
    isFormDirty,
    lastSavedTime,
    handleFormValueChange, 
    clearSavedData,
    calculateNextId,
    saveFormData,
    manualSaveFormData,
    restoreFromBackup,
    recoverBackup
  } = useFormPersistence(form);
  
  // 使用YAML生成钩子
  const { 
    yamlOutput, 
    generateYaml, 
    handleCopyYaml 
  } = useYamlGeneration({ form });
  
  // 使用YAML导入钩子
  const { handleImportYaml } = useYamlImport({ form, calculateNextId });

  // 添加保存中状态和备份状态
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [backupOptions, setBackupOptions] = React.useState<{ label: string; value: string }[]>([]);
  
  // 手动保存表单数据，并显示保存状态
  const handleManualSave = useCallback(() => {
    setIsSaving(true);
    manualSaveFormData();
    
    // 延迟隐藏保存状态
    setTimeout(() => {
      setIsSaving(false);
      // 触发自定义事件，通知其他组件表单已更新
      window.dispatchEvent(new CustomEvent('form-value-updated'));
    }, 500);
  }, [manualSaveFormData]);

  // 显示备份历史
  const showBackupHistory = useCallback(() => {
    const backups = restoreFromBackup();
    
    if (backups.length === 0) {
      message.info('没有可用的备份');
      return;
    }
    
    // 更新备份选项
    const options = backups.map((timestamp) => ({
      label: timestamp,
      value: timestamp
    }));
    
    setBackupOptions(options);
  }, [restoreFromBackup]);
  
  // 恢复备份
  const handleRecoverBackup = useCallback((timestamp: string) => {
    if (isFormDirty) {
      if (!window.confirm('当前有未保存的更改，确定要恢复备份吗？')) {
        return;
      }
    }
    
    const success = recoverBackup(timestamp);
    
    if (success) {
      message.success(`已成功恢复 ${timestamp} 的备份`);
      // 触发自定义事件，通知其他组件表单已更新
      window.dispatchEvent(new CustomEvent('form-value-updated'));
    } else {
      message.error('恢复备份失败');
    }
  }, [isFormDirty, recoverBackup]);

  // 使用useCallback来稳定handleTagsChange的引用，避免不必要的重新渲染
  const handleTagsChange = useCallback((tags: string[]) => {
    handleFormValueChange({ tags }, form.getFieldsValue(true));
  }, [form, handleFormValueChange]);

  // 使用useCallback来稳定handleSolutionsChange的引用，避免不必要的重新渲染
  const handleSolutionsChange = useCallback((solutions: any[]) => {
    handleFormValueChange({ solutions }, form.getFieldsValue(true));
  }, [form, handleFormValueChange]);

  // 初始化监听全局表单更新事件
  useEffect(() => {
    // 自定义事件更新处理程序
    const handleCustomUpdate = () => {
      console.log('收到表单更新事件，触发表单值变更');
      handleFormValueChange({}, form.getFieldsValue(true));
    };
    
    window.addEventListener('form-value-updated', handleCustomUpdate);
    return () => {
      window.removeEventListener('form-value-updated', handleCustomUpdate);
    };
  }, [form, handleFormValueChange]);

  // 提供所有需要的props和handlers给子组件
  const formControls = useMemo(() => ({
    form,
    handlers: {
      handleTagsChange,
      handleSolutionsChange,
      handleImportYaml,
      clearSavedData,
      generateYaml,
      handleCopyYaml,
      handleFormValueChange,
      saveFormData,
      manualSaveFormData: handleManualSave,
      showBackupHistory
    },
    state: {
      yamlOutput,
      initialFormValues,
      isFormDirty,
      lastSavedTime,
      isSaving,
      backupOptions
    }
  }), [
    form, 
    handleTagsChange, 
    handleSolutionsChange, 
    handleImportYaml,
    clearSavedData,
    generateYaml,
    handleCopyYaml,
    handleFormValueChange,
    saveFormData,
    handleManualSave,
    showBackupHistory,
    yamlOutput,
    initialFormValues,
    isFormDirty,
    lastSavedTime,
    isSaving,
    backupOptions
  ]);

  return (
    <>
      {children(formControls)}
      
      {/* 备份恢复弹出菜单 */}
      {backupOptions.length > 0 && (
        <Dropdown 
          overlay={
            <Menu>
              {backupOptions.map(option => (
                <Menu.Item 
                  key={option.value}
                  onClick={() => handleRecoverBackup(option.value)}
                >
                  {option.label}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
        >
          <Button 
            type="default" 
            style={{ 
              position: 'fixed', 
              bottom: 20, 
              right: 20,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center'
            }}
            icon={<HistoryOutlined />}
          >
            恢复备份 <DownOutlined />
          </Button>
        </Dropdown>
      )}
    </>
  );
};

export default FormContainer; 