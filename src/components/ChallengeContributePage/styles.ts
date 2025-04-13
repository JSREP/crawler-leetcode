import { CSSProperties } from 'react';

/**
 * 题目贡献页面样式
 */
export const styles: Record<string, CSSProperties> = {
    container: {
        maxWidth: 1000,
        margin: '0 auto',
        padding: '20px 16px'
    },
    alert: {
        marginBottom: 24
    },
    form: {
        width: '100%'
    },
    formItem: {
        marginBottom: 16
    },
    submitButton: {
        marginTop: 24
    },
    previewContainer: {
        border: '1px solid #d9d9d9',
        padding: 16,
        borderRadius: 4,
        backgroundColor: '#f5f5f5',
        marginBottom: 16
    },
    tagContainer: {
        marginBottom: 8
    },
    solutionContainer: {
        marginBottom: 16,
        border: '1px dashed #d9d9d9',
        padding: 16
    },
    // 步骤标题
    stepTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 24,
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: 12
    },
    // 步骤说明
    stepDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24
    },
    // 卡片样式
    stepCard: {
        marginBottom: 24,
        boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
        borderRadius: 8
    },
    // 卡片标题
    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16
    },
    // 表单分组标题
    sectionTitle: {
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 16,
        color: '#1890ff'
    },
    // 底部固定按钮区
    footerButtons: {
        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: '0 0 8px 8px',
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto'
    },
    // 响应式设计 - 移动端适配
    mobileContainer: {
        padding: '16px 12px'
    },
    // YAML预览区样式
    yamlPreview: {
        fontFamily: 'monospace',
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflowY: 'auto',
        fontSize: '13px',
        border: '1px solid #e8e8e8'
    },
    // 强调文本
    highlight: {
        color: '#1890ff',
        fontWeight: 500
    },
    // 分隔线样式
    divider: {
        margin: '32px 0'
    },
    // 表单区块容器
    formSection: {
        marginBottom: 40
    },
    // 表单区块内部内容
    formSectionContent: {
        padding: '0 16px'
    },
    // 表单底部区域
    formBottom: {
        marginTop: 40,
        marginBottom: 80 // 给底部固定按钮留空间
    },
    // 进度指示器容器
    progressContainer: {
        marginBottom: 24,
        padding: '12px 16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }
}; 