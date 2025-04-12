import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Switch, message, Alert, Input } from 'antd';
import * as YAML from 'yaml';
import { challenges } from '../ChallengeListPage/ChallengeData';

// 导入类型
import { ChallengeFormData } from './types';

// 导入工具函数
import { encodeUrl, decodeUrl, ensureBase64Encoded } from './utils/urlUtils';
import { generateYamlFromFormData } from './utils/yamlUtils';

// 导入子组件
import BasicInfo from './components/BasicInfo';
import DifficultySelector from './components/DifficultySelector';
import DescriptionFields from './components/DescriptionFields';
import TagsSelector from './components/TagsSelector';
import SolutionsSection from './components/SolutionsSection';
import UrlInput from './components/UrlInput';
import YamlPreviewSection from './components/YamlPreviewSection';
import FormSubmitSection from './components/FormSubmitSection';

// 导入样式
import { styles } from './styles';

/**
 * 挑战贡献页面组件
 */
const ChallengeContributePage: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm();
  
  // 状态
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [yamlOutput, setYamlOutput] = useState<string>('');
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean>(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<ChallengeFormData>({
    id: null,
    platform: 'Web',
    idAlias: '',
    name: '',
    nameEn: '',
    difficultyLevel: 1,
    descriptionMarkdown: '',
    descriptionMarkdownEn: '',
    base64Url: '',
    tags: [],
    solutions: [],
    isExpired: false,
  });

  // 初始化下一个可用的ID
  useEffect(() => {
    const nextId = calculateNextId();
    form.setFieldsValue({ id: nextId });
  }, [form]);

  // 计算下一个可用ID
  const calculateNextId = (): number => {
    if (!challenges || challenges.length === 0) {
      return 1;
    }
    const maxId = Math.max(...challenges.map(c => Number(c.id) || 0));
    return maxId + 1;
  };

  // 表单值变更处理
  const handleFormValueChange = () => {
    setIsFormDirty(true);
    if (isPreviewMode) {
      generateYaml();
    }
  };

  // 生成YAML数据
  const generateYaml = () => {
    const values = form.getFieldsValue() as ChallengeFormData;
    
    // 确保URL是Base64编码
    if (values.base64Url) {
      values.base64Url = ensureBase64Encoded(values.base64Url);
      form.setFieldsValue({ base64Url: values.base64Url });
    }
    
    const yamlString = generateYamlFromFormData(values);
    setYamlOutput(yamlString);
  };

  // 处理预览模式切换
  const handleTogglePreview = (checked: boolean) => {
    setIsPreviewMode(checked);
    if (checked) {
      generateYaml();
    }
  };

  // 复制YAML到剪贴板
  const handleCopyYaml = () => {
    if (yamlOutput) {
      navigator.clipboard.writeText(yamlOutput)
        .then(() => {
          message.success('YAML已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制失败，请手动复制');
        });
    }
  };

  // 表单提交
  const handleFinish = async () => {
    try {
      // 验证表单
      await form.validateFields();
      
      // 获取表单数据
      const values = form.getFieldsValue() as ChallengeFormData;
      
      // 确保URL是Base64编码
      if (values.base64Url) {
        values.base64Url = ensureBase64Encoded(values.base64Url);
      }
      
      // 生成YAML
      const yamlString = generateYamlFromFormData(values);
      
      // 标记提交中
      setIsSubmitting(true);
      setSubmitErrorMessage(null);
      
      // 模拟提交操作
      setTimeout(() => {
        console.log('提交的表单数据:', values);
        console.log('生成的YAML:', yamlString);
        
        // 提交成功
        setIsSubmitting(false);
        setIsSubmitSuccess(true);
        setIsFormDirty(false);
        
        // 显示成功消息
        message.success('挑战已成功提交！');
        
        // 3秒后重置成功状态
        setTimeout(() => {
          setIsSubmitSuccess(false);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('表单验证失败:', error);
      setSubmitErrorMessage('表单验证失败，请检查填写的内容。');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <Alert
        message="注意事项"
        description="请填写完整的挑战信息，以便其他用户理解和解决此挑战。所有标记为必填的字段都必须填写。"
        type="info"
        showIcon
        style={styles.alert}
      />
      
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormValueChange}
        style={styles.form}
        initialValues={initialFormValues}
      >
        {/* 基本信息区块 */}
        <BasicInfo form={form} />
        
        {/* 难度选择器 */}
        <DifficultySelector form={form} />
        
        {/* 描述字段 */}
        <DescriptionFields form={form} />
        
        {/* URL输入 */}
        <UrlInput 
          form={form} 
          encodeUrl={encodeUrl} 
          decodeUrl={decodeUrl}
        />
        
        {/* 标签选择器 */}
        <TagsSelector form={form} />
        
        {/* 解决方案部分 */}
        <SolutionsSection form={form} />
        
        {/* 隐藏的isExpired字段 */}
        <Form.Item name="isExpired" hidden initialValue={false}>
          <input type="hidden" />
        </Form.Item>
        
        {/* YAML预览部分 */}
        <YamlPreviewSection
          yamlOutput={yamlOutput}
          isPreviewMode={isPreviewMode}
          onTogglePreview={handleTogglePreview}
          onCopyYaml={handleCopyYaml}
        />
        
        {/* 表单提交部分 */}
        <FormSubmitSection
          onFinish={handleFinish}
          onGenerateYaml={generateYaml}
          isFormDirty={isFormDirty}
          isSubmitting={isSubmitting}
          isSubmitSuccess={isSubmitSuccess}
          submitErrorMessage={submitErrorMessage}
        />
      </Form>
    </div>
  );
};

export default ChallengeContributePage; 