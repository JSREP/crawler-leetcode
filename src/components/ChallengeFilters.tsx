interface ChallengeFiltersProps {
    /**
     * 选中的标签
     */
    selectedTags: string[];
    
    /**
     * 选中的难度
     */
    selectedDifficulty: string[];
    
    /**
     * 选中的平台
     */
    selectedPlatform: string;
    
    /**
     * 是否有过滤器被应用
     */
    hasFilters: boolean;
    
    /**
     * 删除单个标签的回调
     */
    onRemoveTag: (tag: string) => void;
    
    /**
     * 移除难度过滤的回调
     */
    onRemoveDifficulty: () => void;
    
    /**
     * 移除平台过滤的回调
     */
    onRemovePlatform: () => void;
    
    /**
     * 清除所有过滤器的回调
     */
    onClearAll: () => void;

    /**
     * 搜索提交回调
     */
    onSearch: (value: string) => void;

    /**
     * 当前的搜索值
     */
    searchValue?: string;
} 