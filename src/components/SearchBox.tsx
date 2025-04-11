import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Input, Space, Tag, Button, Tooltip, Typography } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

// 防抖函数
const debounce = (fn: Function, delay: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    };
};

/**
 * 搜索提示信息
 */
const SEARCH_TOOLTIP = (
    <div style={{ maxWidth: 320, padding: '8px 4px' }}>
        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>高级搜索提示：</Text>
        <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 5 }}>
            <li><Text style={{ fontSize: '13px' }}>搜索题目标题、描述、标签等所有字段</Text></li>
            <li><Text style={{ fontSize: '13px' }}>支持模糊搜索和拼写容错</Text></li>
            <li><Text style={{ fontSize: '13px' }}>多关键词: "<Text code>动态规划 数组</Text>"</Text></li>
            <li><Text style={{ fontSize: '13px' }}>精确匹配: "<Text code>=动态规划</Text>"</Text></li>
            <li><Text style={{ fontSize: '13px' }}>排除词: "<Text code>!二叉树</Text>"</Text></li>
            <li><Text style={{ fontSize: '13px' }}>前缀匹配: "<Text code>链^</Text>"</Text></li>
            <li><Text style={{ fontSize: '13px' }}>直接输入题号进行搜索</Text></li>
        </ul>
    </div>
);

interface SearchBoxProps {
    /**
     * 搜索值变化的回调函数
     */
    onSearch: (value: string) => void;

    /**
     * 初始搜索值
     */
    value?: string;

    /**
     * 占位符文本
     */
    placeholder?: string;

    /**
     * 是否显示搜索历史
     */
    showHistory?: boolean;

    /**
     * 搜索历史本地存储key
     */
    historyStorageKey?: string;

    /**
     * 防抖延迟时间(ms)
     */
    debounceDelay?: number;
}

/**
 * 高级搜索框组件
 * 支持实时搜索、搜索历史和提示功能
 */
const SearchBox: React.FC<SearchBoxProps> = ({
    onSearch,
    value = '',
    placeholder = '搜索...',
    showHistory = true,
    historyStorageKey = 'recent-searches',
    debounceDelay = 300
}) => {
    // 内部搜索文本状态
    const [inputValue, setInputValue] = useState(value);
    
    // 搜索历史记录
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    
    // 当外部value变化时，更新内部inputValue
    useEffect(() => {
        setInputValue(value);
    }, [value]);
    
    // 创建防抖搜索函数
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            onSearch(value);
            // 只有用户主动输入的搜索才加入历史记录
            if (value.trim()) {
                const searches = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
                const newSearches = [value, ...searches.filter((s: string) => s !== value)].slice(0, 5);
                localStorage.setItem(historyStorageKey, JSON.stringify(newSearches));
                setRecentSearches(newSearches);
            }
        }, debounceDelay),
        [onSearch, historyStorageKey, debounceDelay]
    );
    
    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSearch(value);
    };
    
    // 加载最近搜索记录
    useEffect(() => {
        if (showHistory) {
            const searches = JSON.parse(localStorage.getItem(historyStorageKey) || '[]');
            setRecentSearches(searches);
        }
    }, [showHistory, historyStorageKey]);

    return (
        <div>
            {/* 搜索框 */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search
                    placeholder={placeholder}
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    style={{ 
                        width: '100%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderRadius: '6px'
                    }}
                    value={inputValue}
                    onChange={handleInputChange}
                    onSearch={(value: string) => debouncedSearch(value)}
                />
                
                <Tooltip 
                    title={SEARCH_TOOLTIP} 
                    placement="bottomRight"
                    color="white"
                    overlayInnerStyle={{ 
                        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                        borderRadius: '8px'
                    }}
                >
                    <Button
                        type="text"
                        icon={<InfoCircleOutlined />} 
                        style={{ 
                            position: 'absolute',
                            right: 50,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#1890ff',
                            padding: '0 8px',
                            border: 'none',
                            background: 'transparent'
                        }} 
                    />
                </Tooltip>
            </div>
            
            {/* 最近搜索记录 */}
            {showHistory && recentSearches.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ marginRight: 8 }}>最近搜索:</Text>
                    <Space>
                        {recentSearches.map((search, index) => (
                            <Tag 
                                key={index}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setInputValue(search);
                                    debouncedSearch(search);
                                }}
                            >
                                {search}
                            </Tag>
                        ))}
                        <Button 
                            type="text" 
                            size="small"
                            onClick={() => {
                                localStorage.removeItem(historyStorageKey);
                                setRecentSearches([]);
                            }}
                        >
                            清除
                        </Button>
                    </Space>
                </div>
            )}
        </div>
    );
};

export default SearchBox; 