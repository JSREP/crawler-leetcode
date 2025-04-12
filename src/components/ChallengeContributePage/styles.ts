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
    }
}; 