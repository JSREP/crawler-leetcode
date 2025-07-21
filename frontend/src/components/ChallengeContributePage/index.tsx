import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Form, Button, Card, Space, Affix, message, Progress, Badge, notification, Divider, Typography } from 'antd';
import { SaveOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ChallengeFormData } from './types';
import * as YAML from 'yaml';

// 导入钩子函数
import { 
  useFormPersistence, 
  useYamlGeneration, 
  useYamlImport,
  useFormStyles,
  useAllTags,
  useTagsWithFrequency,
  useEventListener,
  useFormScrolling
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
import ScrollButtons from './components/ScrollButtons';

// 导入样式
import { styles } from './styles';

const { Title, Text } = Typography;

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
  
  // 状态
  const [isBackupModalVisible, setIsBackupModalVisible] = useState<boolean>(false);
  const [formCompletion, setFormCompletion] = useState<number>(0);
  const [autoSaveVisible, setAutoSaveVisible] = useState<boolean>(false);

  // 应用表单样式
  useFormStyles();
  
  // 获取所有已存在的标签
  const allTags = useAllTags();
  
  // 获取带有频率的标签列表
  const tagsWithFrequency = useTagsWithFrequency();
  
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

  // 手动滚动到YAML预览区域
  const scrollToYamlPreviewSection = useCallback(() => {
    console.log('手动触发滚动到YAML预览区域');
    setTimeout(() => {
      try {
        // 尝试通过ID查找
        const element = document.getElementById('yaml-preview-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        
        // 尝试通过类名查找
        const elementByClass = document.querySelector('.yaml-preview-section');
        if (elementByClass) {
          elementByClass.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        
        // 尝试查找标题元素
        const yamlTitle = Array.from(document.querySelectorAll('h4'))
          .find(el => el.textContent?.includes('YAML生成预览'));
        if (yamlTitle) {
          yamlTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        
        // 最后尝试滚动到底部
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error('手动滚动到YAML预览区域时出错:', error);
      }
    }, 300);
  }, []);

  // 包装生成YAML的方法，确保滚动
  const handleGenerateYaml = useCallback(() => {
    console.log('ChallengeContributePage: 调用handleGenerateYaml');
    
    try {
      // 首先直接获取表单当前值，不管验证是否通过
      const currentFormValues = form.getFieldsValue(true);
      
      // 执行YAML生成
      generateYaml();
      
      // 确保滚动到YAML预览区域，使用双重保障
      setTimeout(scrollToYamlPreviewSection, 300);
      setTimeout(scrollToYamlPreviewSection, 800); // 再次尝试滚动，以防第一次失败
      
      // 如果YAML输出为空，尝试直接使用YAML.stringify
      setTimeout(() => {
        if (!yamlOutput && currentFormValues) {
          console.log('检测到YAML输出为空，尝试直接生成');
          
          try {
            const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const directYamlObj = {
              'id': currentFormValues.id || 0,
              'id-alias': currentFormValues.idAlias || '',
              'platform': currentFormValues.platform || 'Web',
              'name': currentFormValues.name || '未命名挑战',
              'difficulty-level': currentFormValues.difficultyLevel || 1,
              'description-markdown': currentFormValues.description || '',
              'base64-url': currentFormValues.base64Url || '',
              'tags': currentFormValues.tags || [],
              'solutions': [],
              'create-time': currentDateTime,
              'update-time': currentDateTime
            };
            
            const directYaml = YAML.stringify(directYamlObj, { indent: 2 });
            setYamlOutput(directYaml);
            console.log('直接生成YAML成功，长度：', directYaml.length);
          } catch (error) {
            console.error('直接生成YAML失败:', error);
          }
        }
      }, 500);
    } catch (error) {
      console.error('处理YAML生成时出错:', error);
      message.error('生成YAML时出错，请检查表单数据');
    }
  }, [generateYaml, scrollToYamlPreviewSection, form, yamlOutput, setYamlOutput]);

  return (
    <ResponsiveContainer>
      {/* 进度指示器 */}
      <div style={styles.progressContainer}>
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
        
        <div style={styles.formSection}>
          {/* 基本信息部分 */}
          <Card style={styles.stepCard} title={<Title level={4}>基本信息</Title>}>
            <div style={styles.formSectionContent}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                请填写挑战的基本信息，包括ID、平台类型、名称、目标网站URL等必要信息。这些信息将用于在列表页展示和搜索。
              </Text>
              <BasicInfo form={form} />
              <DifficultySelector form={form} />
              <UrlInput form={form} />
              <TagsSelector 
                form={form} 
                onChange={handleTagsChange}
                existingTags={allTags}
                tagsFrequency={tagsWithFrequency}
              />
            </div>
          </Card>
        </div>
        
        <Divider style={styles.divider} />
        
        <div style={styles.formSection}>
          {/* 详细描述部分 */}
          <Card style={styles.stepCard} title={<Title level={4}>详细描述</Title>}>
            <div style={styles.formSectionContent}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                请提供挑战的详细描述。描述应尽可能详细，包括挑战要求和技术背景。
              </Text>
              <DescriptionFields form={form} />
            </div>
          </Card>
        </div>
        
        <Divider style={styles.divider} />
        
        <div style={styles.formSection}>
          {/* 标签与参考资料部分 */}
          <Card style={styles.stepCard} title={<Title level={4}>标签与参考资料</Title>}>
            <div style={styles.formSectionContent}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                添加参考资料链接，帮助其他用户快速识别和解决挑战。好的参考资料资源能显著提高挑战的价值。
              </Text>
              <SolutionsSection 
                form={form} 
                onChange={handleSolutionsChange}
              />
            </div>
          </Card>
        </div>
        
        <Divider style={styles.divider} />
        
        <div style={styles.formBottom}>
          {/* YAML预览部分 */}
          <Card style={styles.stepCard} title={<Title level={4}>YAML生成预览</Title>}>
            <div style={styles.formSectionContent}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                检查自动生成的YAML内容，确保所有信息正确。您可以复制YAML用于提交挑战。
              </Text>
              <YamlPreviewSection
                yamlOutput={yamlOutput}
                onGenerateYaml={handleGenerateYaml}
                onCopyYaml={handleCopyYaml}
              />
            </div>
          </Card>
        </div>
        
        {/* 底部固定操作按钮 */}
        <Affix offsetBottom={20}>
          <Card style={styles.footerButtons}>
            <Space>
              <Button 
                icon={<SaveOutlined />}
                onClick={handleManualSave}
                loading={isSaving}
              >
                保存表单
              </Button>
            </Space>
            
            <Button 
              type="primary" 
              onClick={handleGenerateYaml}
              icon={<FileTextOutlined />}
            >
              生成YAML
            </Button>
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
      
      {/* 滚动控制按钮 */}
      <ScrollButtons />
    </ResponsiveContainer>
  );
};

export default ChallengeContributePage; 