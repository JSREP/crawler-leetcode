import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Switch, message, Alert, Input, Button } from 'antd';
import * as YAML from 'yaml';
import { challenges } from '../ChallengeListPage/ChallengeData';

// 导入类型
import { ChallengeFormData } from './types';

// 导入工具函数
import { encodeUrl, decodeUrl, ensureBase64Encoded } from './utils/urlUtils';
import { generateYamlFromFormData, parseYamlToFormData } from './utils/yamlUtils';

// 导入子组件
import BasicInfo from './components/BasicInfo';
import DifficultySelector from './components/DifficultySelector';
import DescriptionFields from './components/DescriptionFields';
import TagsSelector from './components/TagsSelector';
import SolutionsSection from './components/SolutionsSection';
import UrlInput from './components/UrlInput';
import YamlPreviewSection from './components/YamlPreviewSection';
import YamlImportSection from './components/YamlImportSection';

// 导入样式
import { styles } from './styles';

// localStorage键名
const STORAGE_KEY = 'challenge_contribute_form_data';

/**
 * 挑战贡献页面组件
 */
const ChallengeContributePage: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm<ChallengeFormData>();
  
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
    description: '',
    descriptionEn: '',
    tags: [],
    solutions: [],
  });

  // 用于防抖的定时器ID
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

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

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

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
    
    // 清除之前的定时器
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    // 创建新的定时器用于防抖
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
        console.log('表单数据已保存到本地存储');
      } catch (error) {
        console.error('保存数据到本地存储失败:', error);
      }
    }, 500); // 500毫秒防抖时间
    
    // 保存定时器ID
    setSaveTimeoutId(timeoutId);
  };

  // 生成YAML数据
  const generateYaml = () => {
    const values = form.getFieldsValue();
    
    // 如果有原始YAML，尝试保留其格式和注释
    if (values.rawYaml) {
      try {
        // 解析原始YAML以获取其结构
        const originalData = YAML.parse(values.rawYaml) as ChallengeFormData;
        // 使用新值更新结构
        const updatedData = {
          ...originalData,
          ...values,
          rawYaml: undefined // 不要包含在输出中
        };
        // 使用原始YAML的格式重新生成
        const newYaml = YAML.stringify(updatedData, {
          indent: 2,
          lineWidth: -1
        });
        setYamlOutput(newYaml);
        return;
      } catch (error) {
        console.error('使用原始YAML格式重新生成失败:', error);
      }
    }

    // 如果没有原始YAML或重新生成失败，使用默认格式
    const yamlString = YAML.stringify(values, {
      indent: 2,
      lineWidth: -1
    });
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
      
      // 创建初始默认值
      const nextId = calculateNextId();
      const defaultValues: ChallengeFormData = {
        id: nextId,
        platform: 'Web' as 'Web',
        idAlias: '',
        name: '',
        nameEn: '',
        difficultyLevel: 1,
        description: '',
        descriptionEn: '',
        tags: [],
        solutions: [],
        rawYaml: undefined
      };
      
      // 先设置初始值状态
      setInitialFormValues(defaultValues);
      
      // 然后重置表单并设置默认值
      form.resetFields();
      form.setFieldsValue(defaultValues);
      
      // 清空YAML输出
      setYamlOutput('');
      
      // 重置表单状态
      setIsFormDirty(false);
    } catch (error) {
      console.error('清除本地存储的表单数据失败:', error);
      message.error('清除数据失败');
    }
  };

  // 解析YAML函数
  const parseYaml = (yamlContent: string): ChallengeFormData | null => {
    try {
      // 解析YAML字符串
      const yamlData = YAML.parse(yamlContent);
      
      if (!yamlData) {
        console.error('YAML解析结果为空');
        return null;
      }

      console.log('原始YAML数据结构:', yamlData);

      // 检查是否是集合格式的YAML
      let challengeData;
      if (yamlData.challenges && Array.isArray(yamlData.challenges) && yamlData.challenges.length > 0) {
        // 从集合中提取第一个挑战
        console.log('从集合中提取挑战数据:', yamlData.challenges[0]);
        challengeData = yamlData.challenges[0];
      } else if (yamlData.id !== undefined) {
        // 单个挑战格式
        challengeData = yamlData;
      } else {
        console.error('无法识别的YAML格式，没有找到challenges数组或id字段');
        return null;
      }
      
      // 处理base64-url字段
      let base64Url = challengeData['base64-url'] || '';
      console.log('提取到的base64-url:', base64Url);
      
      // 打印关键字段检查
      console.log('挑战数据关键字段:', {
        id: challengeData.id,
        name: challengeData.name,
        platform: challengeData.platform,
        'id-alias': challengeData['id-alias'],
        tags: challengeData.tags,
        'difficulty-level': challengeData['difficulty-level'],
        'description-markdown': challengeData['description-markdown']?.substring(0, 100),
        'base64-url': challengeData['base64-url'],
        solutions: challengeData.solutions
      });
      
      // 创建表单数据
      const formData: ChallengeFormData = {
        id: challengeData.id !== undefined ? Number(challengeData.id) : null,
        idAlias: challengeData['id-alias'] || '',
        platform: challengeData.platform || 'Web',
        name: challengeData.name || '',
        nameEn: challengeData.name_en || '',
        difficultyLevel: Number(challengeData['difficulty-level']) || 1,
        // 处理描述字段，兼容多种格式
        description: challengeData['description-markdown'] || challengeData.description || '',
        descriptionEn: challengeData['description-markdown_en'] || challengeData.descriptionEn || '',
        // 处理base64Url字段，确保正确映射
        base64Url: base64Url,
        // 处理过期标志
        isExpired: challengeData['is-expired'] === true,
        tags: challengeData.tags || [],
        solutions: (challengeData.solutions || []).map((solution: any) => ({
          title: solution.title || '',
          url: solution.url || '',
          source: solution.source || '',
          author: solution.author || ''
        })),
        example: '',
        testCases: [],
        comments: [],
        rawYaml: yamlContent
      };
      
      console.log('转换后的表单数据:', formData);
      
      return formData;
    } catch (error) {
      console.error('解析YAML失败:', error);
      return null;
    }
  };

  // 处理YAML导入
  const handleImportYaml = (yamlContent: string) => {
    try {
      console.log('开始导入YAML:', yamlContent.substring(0, 200) + '...');
      
      // 使用内部函数解析YAML
      const formValues = parseYaml(yamlContent);
      console.log('YAML解析结果:', formValues);
      
      if (!formValues) {
        throw new Error('解析YAML失败');
      }
      
      // 简化验证逻辑，只验证关键字段
      if (formValues.id === undefined) {
        console.warn('导入的YAML缺少id字段，将使用自动生成的ID');
        formValues.id = calculateNextId();
      }
      
      console.log('正在设置表单值:', formValues);
      
      // 先重置表单
      form.resetFields();
      
      // 特别处理description字段，确保表单能识别它
      if (formValues.description) {
        formValues.descriptionMarkdown = formValues.description;
      }
      
      if (formValues.descriptionEn) {
        formValues.descriptionMarkdownEn = formValues.descriptionEn;
      }
      
      // 设置解析后的值
      form.setFieldsValue(formValues);
      
      console.log('表单设置后的值:', form.getFieldsValue());
      
      // 手动触发表单字段的值变更事件，确保所有组件获取到最新值
      // 只验证关键字段，忽略次要字段的验证错误
      const criticalFields = ['id', 'name', 'platform', 'difficultyLevel'];
      for (const field of criticalFields) {
        if (field in formValues) {
          form.validateFields([field]).catch(e => {
            console.log(`关键字段 ${field} 验证错误:`, e);
            // 对于关键字段的错误，可以进行特殊处理
            if (field === 'id' && (formValues.id === undefined || formValues.id === null)) {
              formValues.id = calculateNextId();
              form.setFieldsValue({ id: formValues.id });
            }
          });
        }
      }
      
      // 手动触发描述字段更新事件
      const descriptionUpdateEvent = new CustomEvent('description-updated', { 
        detail: { 
          description: formValues.description || formValues.descriptionMarkdown,
          descriptionEn: formValues.descriptionEn || formValues.descriptionMarkdownEn
        } 
      });
      window.dispatchEvent(descriptionUpdateEvent);
      
      // 处理base64Url
      if (formValues.base64Url) {
        const base64UrlValue = formValues.base64Url.toString();
        console.log('分发base64-url-updated事件:', base64UrlValue);
        const base64UrlEvent = new CustomEvent('base64-url-updated', { 
          detail: { base64Url: base64UrlValue } 
        });
        window.dispatchEvent(base64UrlEvent);
      }
      
      // 对特定字段做额外处理
      // 处理标签
      if (formValues.tags && Array.isArray(formValues.tags)) {
        console.log('分发tags-updated事件:', formValues.tags);
        // 通知TagsSelector组件更新
        const tagsEvent = new CustomEvent('tags-updated', { detail: { tags: formValues.tags } });
        window.dispatchEvent(tagsEvent);
      }
      
      // 处理解决方案
      if (formValues.solutions && Array.isArray(formValues.solutions)) {
        console.log('分发solutions-updated事件:', formValues.solutions);
        // 通知SolutionsSection组件更新
        const solutionsEvent = new CustomEvent('solutions-updated', { detail: { solutions: formValues.solutions } });
        window.dispatchEvent(solutionsEvent);
      }
      
      // 显示详细的成功信息
      message.success({
        content: (
          <div>
            <div>YAML数据已成功导入到表单</div>
            <div>ID: {formValues.id}, 名称: {formValues.name}</div>
            <div>难度: {formValues.difficultyLevel}, 平台: {formValues.platform}</div>
            <div>标签 ({formValues.tags?.length || 0}): {formValues.tags?.join(', ') || '无'}</div>
            <div>解决方案: {formValues.solutions?.length || 0} 个</div>
            <div>描述长度: {formValues.description?.length || 0} 字符</div>
          </div>
        ),
        duration: 8
      });
    } catch (error) {
      console.error('解析YAML失败:', error);
      // 显示详细的错误信息
      message.error({
        content: (
          <div>
            <div>YAML导入失败</div>
            <div>错误信息: {error instanceof Error ? error.message : '未知错误'}</div>
            <div>请检查YAML格式是否正确</div>
          </div>
        ),
        duration: 5
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* 顶部YAML导入部分 */}
      <YamlImportSection onImportYaml={handleImportYaml} />

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
        <TagsSelector form={form} existingTags={challenges?.flatMap(c => c.tags || []).filter((v, i, a) => a.indexOf(v) === i) || []} />
        
        {/* 解决方案部分 */}
        <SolutionsSection form={form} />
      </Form>

      {/* 底部YAML操作按钮 */}
      <YamlPreviewSection
        yamlOutput={yamlOutput}
        onGenerateYaml={generateYaml}
        onCopyYaml={handleCopyYaml}
      />
    </div>
  );
};

export default ChallengeContributePage; 