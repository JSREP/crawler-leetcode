import * as React from 'react';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Space, AutoComplete, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Solution, SectionProps } from '../types';

// URL校验正则表达式
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// 定义常见来源的域名映射
const SOURCE_MAPPING: Record<string, string> = {
  'github.com': 'GitHub',
  'mp.weixin.qq.com': '微信公众号',
  'juejin.cn': '掘金',
  'csdn.net': 'CSDN',
  'zhihu.com': '知乎',
  'segmentfault.com': 'SegmentFault',
  'jianshu.com': '简书',
  'leetcode.cn': 'LeetCode',
  'leetcode.com': 'LeetCode',
  'bilibili.com': 'B站',
  'youtube.com': 'YouTube',
  'blog.csdn.net': 'CSDN',
  'medium.com': 'Medium',
  'dev.to': 'Dev.to',
  'stackoverflow.com': 'Stack Overflow'
};

/**
 * 验证URL是否合法
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 参考资料部分组件
 */
const SolutionsSection: React.FC<SectionProps> = ({ form }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [editingSolutionIndex, setEditingSolutionIndex] = useState<number | null>(null);
  const [authors, setAuthors] = useState<string[]>([]);
  const [urlError, setUrlError] = useState<string>('');
  const [newSolution, setNewSolution] = useState<Solution>({
    title: '',
    url: '',
    source: '',
    author: ''
  });

  // 从所有参考资料中提取作者列表
  useEffect(() => {
    const uniqueAuthors = Array.from(new Set(
      solutions
        .map(s => s.author)
        .filter((author): author is string => author !== undefined && author.trim() !== '')
    ));
    setAuthors(uniqueAuthors);
  }, [solutions]);
  
  // 初始化solutions
  useEffect(() => {
    const formSolutions = form.getFieldValue('solutions');
    if (formSolutions && Array.isArray(formSolutions) && formSolutions.length > 0) {
      setSolutions(formSolutions);
    }
  }, [form]);
  
  // 监听solutions-updated事件
  useEffect(() => {
    const handleSolutionsUpdated = (event: any) => {
      if (event.detail && event.detail.solutions && Array.isArray(event.detail.solutions)) {
        setSolutions(event.detail.solutions);
      }
    };
    
    window.addEventListener('solutions-updated', handleSolutionsUpdated);
    
    return () => {
      window.removeEventListener('solutions-updated', handleSolutionsUpdated);
    };
  }, []);

  // 根据URL自动判断来源
  const getSourceFromUrl = (url: string): string => {
    if (!isValidUrl(url)) return '';
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // 遍历SOURCE_MAPPING查找匹配的来源
      for (const [key, value] of Object.entries(SOURCE_MAPPING)) {
        if (domain.includes(key)) {
          return value;
        }
      }
      
      // 如果没有匹配的预定义来源，返回域名的首字母大写形式
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } catch {
      return '';
    }
  };

  const handleSolutionChange = (field: keyof Solution, value: string) => {
    setNewSolution(prev => {
      const updated = { ...prev, [field]: value };
      
      // 如果更新的是URL字段，验证URL并自动填充source
      if (field === 'url') {
        if (value && !isValidUrl(value)) {
          setUrlError('请输入有效的URL地址');
        } else {
          setUrlError('');
          const source = getSourceFromUrl(value);
          if (source) {
            updated.source = source;
          }
        }
      }
      
      return updated;
    });
  };

  const handleAddSolution = () => {
    // 验证必填字段
    if (!newSolution.title) {
      message.error('请输入参考资料标题');
      return;
    }

    if (!newSolution.url) {
      message.error('请输入参考资料链接');
      return;
    }

    // 验证URL合法性
    if (!isValidUrl(newSolution.url)) {
      message.error('请输入有效的URL地址');
      return;
    }

    if (editingSolutionIndex !== null) {
      // 编辑现有参考资料
      const updatedSolutions = [...solutions];
      updatedSolutions[editingSolutionIndex] = newSolution;
      setSolutions(updatedSolutions);
      setEditingSolutionIndex(null);
      form.setFieldsValue({ solutions: updatedSolutions });
    } else {
      // 添加新参考资料
      const updatedSolutions = [...solutions, newSolution];
      setSolutions(updatedSolutions);
      form.setFieldsValue({ solutions: updatedSolutions });
    }
    
    // 重置表单
    setNewSolution({
      title: '',
      url: '',
      source: '',
      author: ''
    });
    setUrlError('');
  };

  const handleEditSolution = (index: number) => {
    setNewSolution(solutions[index]);
    setEditingSolutionIndex(index);
    setUrlError('');
  };

  const handleRemoveSolution = (index: number) => {
    const updatedSolutions = [...solutions];
    updatedSolutions.splice(index, 1);
    setSolutions(updatedSolutions);
    form.setFieldsValue({ solutions: updatedSolutions });
  };

  const solutionContainerStyle = {
    marginBottom: '16px',
    padding: '8px',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
  };

  return (
    <>
      <Divider orientation="left">参考资料</Divider>
      {solutions.map((solution, index) => (
        <div key={index} style={solutionContainerStyle}>
          <Space style={{ marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
            <div>
              <strong>标题:</strong> {solution.title}
              {solution.source && <> | <strong>来源:</strong> {solution.source}</>}
              {solution.author && <> | <strong>作者:</strong> {solution.author}</>}
            </div>
            <Space>
              <Button icon={<EditOutlined />} size="small" onClick={() => handleEditSolution(index)}>
                编辑
              </Button>
              <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleRemoveSolution(index)}>
                删除
              </Button>
            </Space>
          </Space>
          <div>
            <a href={solution.url} target="_blank" rel="noopener noreferrer">{solution.url}</a>
          </div>
        </div>
      ))}

      <div className="solutions-form-wrapper" style={{ marginTop: 16 }}>
        <div 
          className="form-item"
          style={{ marginBottom: 24 }}
        >
          <div className="form-item-label" style={{ marginBottom: 8 }}>
            <label className="ant-form-item-required">标题</label>
          </div>
          <div className="form-item-control">
            <Input 
              value={newSolution.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSolutionChange('title', e.target.value)}
              placeholder="如: 使用正则表达式解析URL"
            />
            <div className="form-item-help" style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              请输入参考资料的标题
            </div>
          </div>
        </div>

        <div 
          className="form-item"
          style={{ marginBottom: 24 }}
        >
          <div className="form-item-label" style={{ marginBottom: 8 }}>
            <label className="ant-form-item-required">URL</label>
          </div>
          <div className="form-item-control">
            <Input 
              value={newSolution.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSolutionChange('url', e.target.value)}
              placeholder="如: https://github.com/your-repo"
              status={urlError ? "error" : undefined}
            />
            <div className="form-item-help" style={{ fontSize: 12, color: urlError ? '#ff4d4f' : '#999', marginTop: 4 }}>
              {urlError || "请输入参考资料的链接地址"}
            </div>
          </div>
        </div>

        <div 
          className="form-item"
          style={{ marginBottom: 24 }}
        >
          <div className="form-item-label" style={{ marginBottom: 8 }}>
            <label>来源</label>
          </div>
          <div className="form-item-control">
            <Input 
              value={newSolution.source}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSolutionChange('source', e.target.value)}
              placeholder="如: GitHub"
            />
            <div className="form-item-help" style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              可选，会根据URL自动填充
            </div>
          </div>
        </div>

        <div 
          className="form-item"
          style={{ marginBottom: 24 }}
        >
          <div className="form-item-label" style={{ marginBottom: 8 }}>
            <label>作者</label>
          </div>
          <div className="form-item-control">
            <AutoComplete
              value={newSolution.author}
              onChange={(value) => handleSolutionChange('author', value)}
              options={authors.map(author => ({ value: author }))}
              placeholder="请输入作者名称"
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
            <div className="form-item-help" style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              可选，支持自动补全已有作者
            </div>
          </div>
        </div>

        <Button 
          type="dashed" 
          onClick={handleAddSolution}
          icon={<PlusOutlined />}
          disabled={!newSolution.title || !newSolution.url || !!urlError}
        >
          {editingSolutionIndex !== null ? '更新参考资料' : '添加参考资料'}
        </Button>
        {editingSolutionIndex !== null && (
          <Button 
            style={{ marginLeft: 8 }}
            onClick={() => {
              setEditingSolutionIndex(null);
              setNewSolution({
                title: '',
                url: '',
                source: '',
                author: ''
              });
              setUrlError('');
            }}
          >
            取消编辑
          </Button>
        )}
      </div>
      
      {/* 隐藏的表单字段，用于提交参考资料数据 */}
      <Form.Item name="solutions" hidden>
        <input type="hidden" />
      </Form.Item>
    </>
  );
};

export default SolutionsSection; 