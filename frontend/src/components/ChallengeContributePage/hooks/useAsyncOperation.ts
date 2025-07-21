import { useState, useCallback } from 'react';
import { message } from 'antd';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showSuccessMessage?: boolean | string;
  showErrorMessage?: boolean | string;
}

/**
 * 异步操作管理 Hook
 * @param initialData 初始数据
 * @param options 配置选项
 */
export const useAsyncOperation = <T>(
  initialData: T | null = null,
  options: AsyncOperationOptions<T> = {}
) => {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  /**
   * 执行异步操作
   * @param asyncFn 异步函数
   * @param operationOptions 本次操作的特定选项，会覆盖全局选项
   */
  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      operationOptions?: AsyncOperationOptions<T>
    ) => {
      // 合并全局选项和本次操作特定选项
      const mergedOptions = { ...options, ...operationOptions };
      const {
        onSuccess,
        onError,
        showSuccessMessage,
        showErrorMessage
      } = mergedOptions;

      setState(prevState => ({ ...prevState, loading: true, error: null }));

      try {
        const result = await asyncFn();
        setState({ data: result, loading: false, error: null });

        // 显示成功消息
        if (showSuccessMessage) {
          const messageText =
            typeof showSuccessMessage === 'string'
              ? showSuccessMessage
              : '操作成功';
          message.success(messageText);
        }

        // 调用成功回调
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ data: null, loading: false, error });

        // 显示错误消息
        if (showErrorMessage) {
          const messageText =
            typeof showErrorMessage === 'string'
              ? showErrorMessage
              : `操作失败: ${error.message}`;
          message.error(messageText);
        }

        // 调用错误回调
        if (onError) {
          onError(error);
        }

        throw error;
      }
    },
    [options]
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset
  };
};

export default useAsyncOperation; 