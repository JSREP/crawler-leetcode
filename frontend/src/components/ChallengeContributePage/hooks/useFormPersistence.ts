import { FormInstance, message } from 'antd';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChallengeFormData } from '../types';
import { challenges } from '../../ChallengeListPage/ChallengeData';

// localStorage键名
const STORAGE_KEY = 'challenge_contribute_form_data';
const SAVE_TIME_KEY = 'challenge_contribute_last_save';
const BACKUP_KEY = 'challenge_contribute_form_backup'; // 新增：备份键名
const MAX_BACKUPS = 5; // 新增：最大备份数量

// 格式化日期时间为友好格式
const formatDateTime = (dateTime: string | Date) => {
  if (!dateTime) return '';
  
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  // 判断是否是今天
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
  
  // 格式化时间
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;
  
  // 根据是否是今天返回不同格式
  if (isToday) {
    return `今天 ${timeStr}`;
  } else {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${timeStr}`;
  }
};

// 默认表单数据
const createDefaultFormValues = (id: number): ChallengeFormData => ({
  id,
  platform: 'Web',
  idAlias: '',
  name: '',
  nameEn: '',
  difficultyLevel: 1,
  description: '',
  descriptionEn: '',
  tags: [],
  solutions: [],
  rawYaml: '',
  createTime: new Date().toISOString(),
  updateTime: new Date().toISOString()
});

interface FormPersistenceState {
  initialFormValues: ChallengeFormData;
  isFormDirty: boolean;
  lastSavedTime: string;
  handleFormValueChange: (changedValues: Partial<ChallengeFormData>, allValues: ChallengeFormData) => void;
  clearSavedData: () => boolean;
  calculateNextId: () => number;
  saveFormData: () => boolean;
  manualSaveFormData: () => void; // 新增：手动保存方法
  restoreFromBackup: () => string[]; // 新增：查看可恢复的备份
  recoverBackup: (timestamp: string) => boolean; // 新增：从特定备份恢复
}

/**
 * 处理表单数据的持久化
 */
export const useFormPersistence = (form: FormInstance<ChallengeFormData>): FormPersistenceState => {
  // 表单状态
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false); // 新增：保存中状态

  // 计算下一个可用ID - 提取为可缓存的计算函数
  const calculateNextId = useCallback((): number => {
    if (!challenges || challenges.length === 0) {
      return 1;
    }
    const maxId = Math.max(...challenges.map(c => Number(c.id) || 0));
    return maxId + 1;
  }, []);

  // 创建初始表单值 - 使用useMemo缓存计算结果
  const initialFormValues = useMemo(() => {
    // 尝试从本地存储加载数据
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTime = localStorage.getItem(SAVE_TIME_KEY);
      
      if (savedTime) {
        setLastSavedTime(formatDateTime(savedTime));
      }
      
      if (savedData) {
        const parsedData = JSON.parse(savedData) as ChallengeFormData;
        console.log('从本地存储读取到保存的表单数据');
        return parsedData;
      }
    } catch (error) {
      console.error('从本地存储读取数据失败:', error);
    }
    
    // 如果没有保存的数据，返回默认值
    return createDefaultFormValues(calculateNextId());
  }, [calculateNextId]);

  // 表单初始化 - 从localStorage加载数据
  useEffect(() => {
    // 将初始值设置到表单
    form.setFieldsValue(initialFormValues);
    console.log('已初始化表单数据');
  }, [form, initialFormValues]);

  // 创建数据备份 - 新增功能
  const createBackup = useCallback((formData: ChallengeFormData) => {
    try {
      // 获取当前已有的备份
      const backupsJson = localStorage.getItem(BACKUP_KEY);
      const backups = backupsJson ? JSON.parse(backupsJson) : {};
      
      // 创建新备份的时间戳
      const timestamp = new Date().toISOString();
      
      // 添加新备份
      backups[timestamp] = formData;
      
      // 如果备份超过最大数量，删除最早的备份
      const timestamps = Object.keys(backups).sort();
      if (timestamps.length > MAX_BACKUPS) {
        delete backups[timestamps[0]];
      }
      
      // 保存更新后的备份
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
      console.log('已创建表单数据备份');
    } catch (error) {
      console.error('创建备份失败:', error);
    }
  }, []);

  // 保存数据到localStorage
  const saveToLocalStorage = useCallback((formData: ChallengeFormData) => {
    try {
      // 更新时间戳
      const now = new Date();
      formData.updateTime = now.toISOString();
      
      // 保存表单数据
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      
      // 保存最后保存时间
      localStorage.setItem(SAVE_TIME_KEY, now.toISOString());
      
      // 创建备份 - 每次保存都创建备份
      createBackup(formData);
      
      // 更新状态
      setLastSavedTime(formatDateTime(now));
      setIsFormDirty(false);
      
      console.log('表单数据已保存到本地存储');
      return true;
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
      return false;
    }
  }, [createBackup]);

  // 手动保存表单数据
  const saveFormData = useCallback(() => {
    const currentValues = form.getFieldsValue(true);
    return saveToLocalStorage(currentValues);
  }, [form, saveToLocalStorage]);
  
  // 手动保存并显示提示 - 新增功能
  const manualSaveFormData = useCallback(() => {
    setIsSaving(true);
    
    const success = saveFormData();
    if (success) {
      message.success('表单数据已保存');
    } else {
      message.error('保存失败，请重试');
    }
    
    // 延迟隐藏保存状态
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [saveFormData]);

  // 查看可恢复的备份 - 新增功能
  const restoreFromBackup = useCallback((): string[] => {
    try {
      const backupsJson = localStorage.getItem(BACKUP_KEY);
      if (!backupsJson) return [];
      
      const backups = JSON.parse(backupsJson);
      return Object.keys(backups).sort().reverse().map(timestamp => formatDateTime(timestamp));
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }, []);
  
  // 从特定备份恢复 - 新增功能
  const recoverBackup = useCallback((timestamp: string): boolean => {
    try {
      const backupsJson = localStorage.getItem(BACKUP_KEY);
      if (!backupsJson) return false;
      
      const backups = JSON.parse(backupsJson);
      const backupTimestamps = Object.keys(backups);
      
      // 找到对应的时间戳
      const targetTimestamp = backupTimestamps.find(
        t => formatDateTime(t) === timestamp
      );
      
      if (!targetTimestamp || !backups[targetTimestamp]) {
        return false;
      }
      
      // 恢复数据
      const recoveredData = backups[targetTimestamp];
      form.resetFields();
      form.setFieldsValue(recoveredData);
      
      // 同时更新localStorage中的当前数据
      saveToLocalStorage(recoveredData);
      
      return true;
    } catch (error) {
      console.error('从备份恢复失败:', error);
      return false;
    }
  }, [form, saveToLocalStorage]);

  // 监听自定义的表单值更新事件
  useEffect(() => {
    const handleFormValueUpdated = () => {
      // 获取最新的表单值
      const currentValues = form.getFieldsValue(true);
      console.log('接收到表单值更新事件，保存数据');
      saveToLocalStorage(currentValues);
    };

    // 添加事件监听
    window.addEventListener('form-value-updated', handleFormValueUpdated);
    
    // 清理事件监听
    return () => {
      window.removeEventListener('form-value-updated', handleFormValueUpdated);
    };
  }, [form, saveToLocalStorage]);

  // 设置自动保存间隔
  useEffect(() => {
    // 每60秒自动保存一次
    const interval = setInterval(() => {
      if (isFormDirty) {
        saveFormData();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [isFormDirty, saveFormData]);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
      }
    };
  }, [saveTimeoutId]);

  // 表单值变更处理 (防抖保存)
  const handleFormValueChange = useCallback((changedValues: Partial<ChallengeFormData>, allValues: ChallengeFormData) => {
    setIsFormDirty(true);
    
    // 清除之前的定时器
    if (saveTimeoutId) {
      clearTimeout(saveTimeoutId);
    }
    
    // 创建新的定时器用于防抖
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(allValues);
    }, 500); // 500毫秒防抖时间
    
    // 保存定时器ID
    setSaveTimeoutId(timeoutId);
  }, [saveTimeoutId, saveToLocalStorage]);

  // 清除保存的表单数据
  const clearSavedData = useCallback(() => {
    try {
      // 删除本地存储数据
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SAVE_TIME_KEY);
      
      // 创建新的默认值
      const defaultValues = createDefaultFormValues(calculateNextId());
      
      // 重置表单并设置默认值
      form.resetFields();
      form.setFieldsValue(defaultValues);
      
      // 重置表单状态
      setIsFormDirty(false);
      setLastSavedTime('');
      
      return true; // 返回成功状态
    } catch (error) {
      console.error('清除本地存储的表单数据失败:', error);
      return false; // 返回失败状态
    }
  }, [form, calculateNextId]);

  // 添加窗口关闭提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        // 尝试保存
        saveFormData();
        
        // 显示提示
        const message = '有未保存的更改，确定要离开吗？';
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty, saveFormData]);

  return {
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
  };
}; 