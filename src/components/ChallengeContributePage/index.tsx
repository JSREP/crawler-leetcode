import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Steps, Button, Card, Space, Affix, message, Progress, Badge, notification } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ChallengeFormData } from './types';

// 导入钩子函数
import { 
  useFormPersistence, 
  useYamlGeneration, 
  useYamlImport,
  useFormStyles
} from './hooks';

// 导入子组件
import BasicInfo from './components/BasicInfo';
import DifficultySelector from './components/DifficultySelector';
import DescriptionFields from './components/DescriptionFields';
import TagsSelector from './components/TagsSelector';
import SolutionsSection from './components/SolutionsSection';
import UrlInput from './components/UrlInput';
import YamlPreviewSection from './components/YamlPreviewSection';
import YamlImportSection from './components/YamlImportSection';
import FormHeader from './components/FormHeader';
import ResponsiveContainer from './components/ResponsiveContainer';

// 导入样式
import { styles } from './styles';

const { Step } = Steps;

/**
 * 备份历史模态框组件
 */
interface BackupHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  backupOptions: { label: string; value: string }[];
  onRecover: (timestamp: string) => void;
}

// 备份历史模态框组件的临时实现
const BackupHistoryModal: React.FC<BackupHistoryModalProps> = ({
  visible,
  onClose,
  backupOptions,
  onRecover
}) => {
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 4,
          width: 400,
          maxWidth: '90%'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3>备份历史</h3>
        {backupOptions.length === 0 ? (
          <p>没有可用的备份</p>
        ) : (
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {backupOptions.map(option => (
              <li 
                key={option.value}
                style={{ 
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                <div>{option.label}</div>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => onRecover(option.value)}
                  style={{ marginTop: 4 }}
                >
                  恢复
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
};

/**
 * 挑战贡献页面组件
 */
const ChallengeContributePage: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm<ChallengeFormData>();
  
  // 步骤状态
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isBackupModalVisible, setIsBackupModalVisible] = useState<boolean>(false);
  const [formCompletion, setFormCompletion] = useState<number>(0);
  const [autoSaveVisible, setAutoSaveVisible] = useState<boolean>(false);

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
    handleCopyYaml,
    setYamlOutput
  } = useYamlGeneration({ form });
  
  // 使用YAML导入钩子
  const { handleImportYaml } = useYamlImport({ form, calculateNextId });

  // 添加保存中状态和备份选项
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [backupOptions, setBackupOptions] = useState<{ label: string; value: string }[]>([]);

  // 手动保存表单数据，带界面反馈
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

  // 查询并显示备份历史
  const showBackupHistory = useCallback(() => {
    const backups = restoreFromBackup();
    
    if (backups.length === 0) {
      message.info('没有可用的备份历史');
      return;
    }
    
    // 更新备份选项
    const options = backups.map((timestamp) => ({
      label: timestamp,
      value: timestamp
    }));
    
    setBackupOptions(options);
    setIsBackupModalVisible(true);
  }, [restoreFromBackup]);

  // 处理备份恢复
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
      setIsBackupModalVisible(false);
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

  // 监听表单值变化，更新完成度
  useEffect(() => {
    const calculateFormCompletion = () => {
      const values = form.getFieldsValue(true);
      const requiredFields = [
        'id', 'platform', 'name', 'difficultyLevel', 
        'description', 'base64Url', 'tags'
      ];
      
      // 计算已填写的必填字段数量
      let filledCount = 0;
      requiredFields.forEach(field => {
        const value = values[field as keyof ChallengeFormData];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) filledCount++;
          } else {
            filledCount++;
          }
        }
      });
      
      // 计算完成百分比
      const percent = Math.round((filledCount / requiredFields.length) * 100);
      setFormCompletion(percent);
    };
    
    // 初始计算
    calculateFormCompletion();
    
    // 监听表单值变化事件
    const handleFormUpdate = () => {
      calculateFormCompletion();
      
      // 显示自动保存提示
      setAutoSaveVisible(true);
      setTimeout(() => {
        setAutoSaveVisible(false);
      }, 3000);
    };
    
    window.addEventListener('form-value-updated', handleFormUpdate);
    return () => {
      window.removeEventListener('form-value-updated', handleFormUpdate);
    };
  }, [form]);

  // 显示自动保存通知
  useEffect(() => {
    // 设置自动保存通知
    const openAutoSaveNotification = () => {
      if (isFormDirty) {
        notification.info({
          message: '自动保存已启用',
          description: '您的表单数据将每60秒自动保存一次，您也可以随时手动保存。',
          placement: 'bottomRight',
          duration: 4,
          icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
        });
      }
    };
    
    // 初始显示一次
    const timer = setTimeout(openAutoSaveNotification, 5000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [isFormDirty]);

  // 步骤定义
  const steps = [
    {
      title: '基本信息',
      content: (
        <>
          <div style={styles.stepTitle}>步骤 1：填写基本信息</div>
          <div style={styles.stepDescription}>
            请填写挑战的基本信息，包括ID、平台类型、名称等必要信息。这些信息将用于在列表页展示和搜索。
          </div>
          <BasicInfo form={form} />
          <DifficultySelector form={form} />
        </>
      ),
      validationFields: ['id', 'platform', 'name', 'difficultyLevel']
    },
    {
      title: '详细描述',
      content: (
        <>
          <div style={styles.stepTitle}>步骤 2：填写详细描述</div>
          <div style={styles.stepDescription}>
            请提供挑战的详细描述和目标网站URL（将自动转为Base64编码）。描述应尽可能详细，包括挑战要求和技术背景。
          </div>
          <DescriptionFields form={form} />
          <UrlInput form={form} />
        </>
      ),
      validationFields: ['description', 'base64Url']
    },
    {
      title: '标签与解决方案',
      content: (
        <>
          <div style={styles.stepTitle}>步骤 3：添加标签和解决方案</div>
          <div style={styles.stepDescription}>
            添加相关技术标签和解决方案链接，帮助其他用户快速识别和解决挑战。好的标签和解决方案资源能显著提高挑战的价值。
          </div>
          <TagsSelector 
            form={form} 
            onChange={handleTagsChange}
          />
          <SolutionsSection 
            form={form} 
            onChange={handleSolutionsChange}
          />
        </>
      ),
      validationFields: ['tags']
    },
    {
      title: 'YAML预览',
      content: (
        <>
          <div style={styles.stepTitle}>步骤 4：生成和检查YAML</div>
          <div style={styles.stepDescription}>
            检查自动生成的YAML内容，确保所有信息正确。您可以复制YAML用于提交挑战。如需修改信息，可以返回前面的步骤进行编辑。
          </div>
          <YamlPreviewSection
            yamlOutput={yamlOutput}
            onGenerateYaml={generateYaml}
            onCopyYaml={handleCopyYaml}
          />
        </>
      ),
      validationFields: []
    }
  ];

  // 处理步骤变更前的验证
  const handleStepChange = async (step: number) => {
    // 如果是向后移动，验证当前步骤的字段
    if (step > currentStep) {
      try {
        // 获取当前步骤所需验证的字段
        const fieldsToValidate = steps[currentStep].validationFields;
        if (fieldsToValidate.length > 0) {
          await form.validateFields(fieldsToValidate);
        }
        // 验证通过，可以移动到下一步
        setCurrentStep(step);
        // 如果移动到最后一步，自动生成YAML
        if (step === steps.length - 1) {
          setTimeout(() => {
            generateYaml();
          }, 300);
        }
      } catch (error) {
        // 验证失败，显示错误消息
        message.error('请填写所有必填字段后再继续');
      }
    } else {
      // 向前移动不需要验证
      setCurrentStep(step);
    }
  };

  // 前进到下一步
  const goNext = () => {
    handleStepChange(currentStep + 1);
  };

  // 返回上一步
  const goPrevious = () => {
    handleStepChange(currentStep - 1);
  };

  return (
    <ResponsiveContainer>
      {/* 进度指示器 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span>表单完成度: {formCompletion}%</span>
          <Badge 
            status={autoSaveVisible ? "processing" : "default"} 
            text={autoSaveVisible ? "正在保存..." : "自动保存已启用"}
            style={{ opacity: autoSaveVisible ? 1 : 0.7 }}
          />
        </div>
        <Progress 
          percent={formCompletion} 
          strokeColor={formCompletion === 100 ? "#52c41a" : "#1890ff"}
          size="small" 
          status={formCompletion === 100 ? "success" : "active"}
        />
      </div>

      {/* 顶部YAML导入部分 */}
      <YamlImportSection onImportYaml={handleImportYaml} />

      {/* 表单提示信息 */}
      <FormHeader 
        clearSavedData={clearSavedData} 
        isFormDirty={isFormDirty}
        lastSavedTime={lastSavedTime}
        onManualSave={handleManualSave}
        onShowBackups={showBackupHistory}
      />
      
      {/* 步骤导航 */}
      <Card style={{ marginBottom: 20, ...styles.stepCard }}>
        <Steps current={currentStep} onChange={handleStepChange} responsive={true} style={styles.stepsNav}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
      </Card>
      
      {/* 表单内容 */}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormValueChange}
        style={styles.form}
        initialValues={initialFormValues}
      >
        {/* 隐藏字段，用于保存原始YAML */}
        <Form.Item name="rawYaml" hidden>
          <input type="hidden" />
        </Form.Item>
        
        {/* 当前步骤内容 */}
        <Card style={styles.stepCard}>
          {steps[currentStep].content}
        </Card>
        
        {/* 步骤操作按钮 */}
        <Affix offsetBottom={20}>
          <Card style={styles.footerButtons}>
            <Space>
              <Button 
                icon={<SaveOutlined />}
                onClick={handleManualSave}
                loading={isSaving}
              >
                保存
              </Button>
            </Space>
            
            <Space>
              {currentStep > 0 && (
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={goPrevious}
                >
                  上一步
                </Button>
              )}
              
              {currentStep < steps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={goNext}
                  icon={<ArrowRightOutlined />}
                >
                  下一步
                </Button>
              )}
              
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  onClick={generateYaml}
                  icon={<CheckOutlined />}
                >
                  生成YAML
                </Button>
              )}
            </Space>
          </Card>
        </Affix>
      </Form>
      
      {/* 备份历史模态框 */}
      <BackupHistoryModal 
        visible={isBackupModalVisible}
        onClose={() => setIsBackupModalVisible(false)}
        backupOptions={backupOptions}
        onRecover={handleRecoverBackup}
      />
    </ResponsiveContainer>
  );
};

export default ChallengeContributePage; 