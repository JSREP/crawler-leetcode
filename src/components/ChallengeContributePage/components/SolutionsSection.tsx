import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { Form, Divider, message, Empty } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { Solution, SectionProps } from '../types';
import { isValidUrl, getSourceFromUrl } from '../utils/urlUtils';
import SolutionItem from './SolutionItem';
import SolutionForm from './SolutionForm';
import { solutionsValidator } from '../utils/validators';

// 拖拽排序后的数组重排
const reorder = (list: Solution[], startIndex: number, endIndex: number): Solution[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

interface SolutionsSectionProps extends SectionProps {
  onChange?: (solutions: Solution[]) => void;
}

/**
 * 参考资料部分组件
 */
const SolutionsSection: React.FC<SolutionsSectionProps> = memo(({ form, onChange }) => {
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

  // 包装onChange回调，确保稳定引用
  const stableOnChange = useCallback((updatedSolutions: Solution[]) => {
    if (onChange) {
      onChange(updatedSolutions);
    }
  }, [onChange]);

  // 触发表单更新事件 - 使用useCallback确保稳定引用
  const triggerFormUpdate = useCallback((updatedSolutions: Solution[]) => {
    // 更新表单字段
    form.setFieldsValue({ solutions: updatedSolutions });
    
    // 主动触发表单验证，确保数据有效
    form.validateFields(['solutions']).catch(() => {
      // 忽略验证错误
    }).then(() => {
      // 使用自定义事件触发表单值更新
      const updateEvent = new CustomEvent('form-value-updated');
      window.dispatchEvent(updateEvent);
      
      // 使用稳定的onChange回调
      stableOnChange(updatedSolutions);
    });
  }, [form, stableOnChange]);

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
    const handleSolutionsUpdated = (event: CustomEvent<{ solutions: Solution[] }>) => {
      if (event.detail && event.detail.solutions && Array.isArray(event.detail.solutions)) {
        setSolutions(event.detail.solutions);
        
        // 更新表单字段
        form.setFieldsValue({ solutions: event.detail.solutions });
      }
    };
    
    window.addEventListener('solutions-updated', handleSolutionsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('solutions-updated', handleSolutionsUpdated as EventListener);
    };
  }, [form]);

  const handleSolutionChange = useCallback((field: keyof Solution, value: string) => {
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
  }, []);

  const handleAddSolution = useCallback(() => {
    // 验证必填字段
    if (!newSolution.title || !newSolution.url || !isValidUrl(newSolution.url)) {
      return;
    }

    let updatedSolutions: Solution[];
    
    if (editingSolutionIndex !== null) {
      // 编辑现有参考资料
      updatedSolutions = [...solutions];
      updatedSolutions[editingSolutionIndex] = newSolution;
      setSolutions(updatedSolutions);
      setEditingSolutionIndex(null);
      message.success('参考资料已更新');
    } else {
      // 添加新参考资料
      updatedSolutions = [...solutions, newSolution];
      setSolutions(updatedSolutions);
      message.success('参考资料已添加');
    }
    
    // 触发表单更新
    triggerFormUpdate(updatedSolutions);
    
    // 重置表单
    setNewSolution({
      title: '',
      url: '',
      source: '',
      author: ''
    });
    setUrlError('');
  }, [editingSolutionIndex, newSolution, solutions, triggerFormUpdate]);

  const handleEditSolution = useCallback((index: number) => {
    setNewSolution(solutions[index]);
    setEditingSolutionIndex(index);
    setUrlError('');
  }, [solutions]);

  const handleRemoveSolution = useCallback((index: number) => {
    const updatedSolutions = [...solutions];
    updatedSolutions.splice(index, 1);
    setSolutions(updatedSolutions);
    
    // 触发表单更新
    triggerFormUpdate(updatedSolutions);
    message.success('参考资料已删除');
  }, [solutions, triggerFormUpdate]);

  const handleCancelEditing = useCallback(() => {
    setEditingSolutionIndex(null);
    setNewSolution({
      title: '',
      url: '',
      source: '',
      author: ''
    });
    setUrlError('');
  }, []);

  // 处理拖拽结束事件
  const handleDragEnd = useCallback((result: DropResult) => {
    // 如果没有目标或拖拽取消，则不执行任何操作
    if (!result.destination) {
      return;
    }

    // 拖拽到了相同位置，不执行任何操作
    if (result.destination.index === result.source.index) {
      return;
    }

    // 重新排序参考资料
    const updatedSolutions = reorder(
      solutions,
      result.source.index,
      result.destination.index
    );

    // 更新状态
    setSolutions(updatedSolutions);
    
    // 触发表单更新
    triggerFormUpdate(updatedSolutions);
    message.info('参考资料顺序已更新');
  }, [solutions, triggerFormUpdate]);

  return (
    <>
      <Divider orientation="left">参考资料</Divider>
      
      <Form.Item
        name="solutions"
        rules={[solutionsValidator]}
        validateTrigger={['onChange', 'onBlur']}
        style={{ marginBottom: 0 }}
        extra="参考资料为可选项，无需强制填写"
        required={false}
      >
        <div style={{ display: 'none' }}></div>
      </Form.Item>
      
      {solutions.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无参考资料"
          style={{ margin: '20px 0' }}
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="solutions-list">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ marginBottom: 20 }}
              >
                {solutions.map((solution, index) => (
                  <Draggable key={`solution-${index}`} draggableId={`solution-${index}`} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <SolutionItem 
                          key={index}
                          solution={solution}
                          index={index}
                          onEdit={handleEditSolution}
                          onRemove={handleRemoveSolution}
                          isDraggable={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* 参考资料表单 */}
      <SolutionForm
        solution={newSolution}
        authors={authors}
        urlError={urlError}
        isEditing={editingSolutionIndex !== null}
        onSolutionChange={handleSolutionChange}
        onAddSolution={handleAddSolution}
        onCancelEditing={handleCancelEditing}
      />
    </>
  );
});

export default SolutionsSection; 