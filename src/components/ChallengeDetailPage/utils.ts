/**
 * 根据难度等级返回对应的CSS类名
 */
export const getDifficultyBadgeClass = (difficulty: number): string => {
    switch (difficulty) {
        case 1:
            return 'bg-green-100 text-green-800';
        case 2:
        case 3:
            return 'bg-yellow-100 text-yellow-800';
        case 4:
        case 5:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/**
 * 根据难度等级返回中文描述
 */
export const getDifficultyText = (difficulty: number): string => {
    switch (difficulty) {
        case 1:
            return '简单';
        case 2:
        case 3:
            return '中等';
        case 4:
        case 5:
            return '困难';
        default:
            return '未知';
    }
}; 