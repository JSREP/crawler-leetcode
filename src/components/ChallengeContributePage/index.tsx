import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Switch, message, Alert, Input, Button } from 'antd';
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

// 导入样式
import { styles } from './styles';

// localStorage键名
const STORAGE_KEY = 'challenge_contribute_form_data';

/**
 * 挑战贡献页面组件
 */
const ChallengeContributePage: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm();
  
  // 状态
  const [yamlOutput, setYamlOutput] = useState<string>('');
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
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

  // 从localStorage加载保存的表单数据
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as ChallengeFormData;
        setInitialFormValues(parsedData);
        form.setFieldsValue(parsedData);
        console.log('已从本地存储恢复表单数据');
      }
    } catch (error) {
      console.error('从本地存储恢复数据失败:', error);
    }
  }, [form]);

  // 初始化下一个可用的ID
  useEffect(() => {
    // 只有当localStorage中没有保存的ID时，才使用自动计算的ID
    if (!initialFormValues.id) {
      const nextId = calculateNextId();
      form.setFieldsValue({ id: nextId });
    }
  }, [form, initialFormValues.id]);

  // 计算下一个可用ID
  const calculateNextId = (): number => {
    if (!challenges || challenges.length === 0) {
      return 1;
    }
    const maxId = Math.max(...challenges.map(c => Number(c.id) || 0));
    return maxId + 1;
  };

  // 表单值变更处理
  const handleFormValueChange = (changedValues: any, allValues: any) => {
    setIsFormDirty(true);
    
    // 将表单数据保存到localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
      console.log('表单数据已保存到本地存储');
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
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

  // 清除保存的表单数据
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      message.success('已清除本地存储的表单数据');
      // 重置表单
      form.resetFields();
      const nextId = calculateNextId();
      form.setFieldsValue({ 
        id: nextId,
        platform: 'Web',
        isExpired: false
      });
      setIsFormDirty(false);
    } catch (error) {
      console.error('清除本地存储的表单数据失败:', error);
      message.error('清除数据失败');
    }
  };

  return (
    <div style={styles.container}>
      <Alert
        message="注意事项"
        description={
          <div>
            <p>请填写完整的挑战信息，以便其他用户理解和解决此挑战。所有标记为必填的字段都必须填写。</p>
            <p>表单数据会自动保存到浏览器本地存储，刷新页面后可以继续编辑。</p>
            <div style={{ marginTop: 8 }}>
              <Button size="small" danger onClick={clearSavedData}>
                清除已保存的数据
              </Button>
            </div>
          </div>
        }
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
        
        {/* YAML生成部分 */}
        <YamlPreviewSection
          yamlOutput={yamlOutput}
          onGenerateYaml={generateYaml}
          onCopyYaml={handleCopyYaml}
        />
      </Form>
    </div>
  );
};

export default ChallengeContributePage; 