export type Solution = {
    title: string;
    url: string;
    source: string;
    author?: string;  // 添加作者字段
};

export type Challenge = {
    id: number;       // 唯一整数ID
    idAlias?: string; // 唯一字符串别名，用于友好URL和显示
    number: number;
    title: string;
    difficulty: number;
    tags: string[];
    solutions: Solution[];
    createTime: Date;
    updateTime: Date;
    externalLink: string;
    platform?: string;  // 添加平台字段
    isExpired?: boolean;  // 添加链接失效状态字段
    descriptionMarkdown: string;  // Markdown描述字段，唯一的描述方式
};

export const parseChallenges = (raw: any[]): Challenge[] => {
    if (!Array.isArray(raw)) {
        console.warn('Expected raw challenges to be an array, got:', typeof raw);
        return []; // 返回空数组避免错误
    }
    return raw.map(c => ({
        id: parseInt(c.id || "0", 10), // 将id解析为数字
        idAlias: c['id-alias'] || c.id?.toString() || "", // 获取id-alias或使用id作为备选
        number: parseInt(c.number || "0", 10),
        title: c.title || c.name || "",
        difficulty: parseInt(c.difficulty || c['difficulty-level'] || "1", 10),
        tags: c.tags || [],
        solutions: (c.solutions || []).map((s: any) => ({
            title: s.title || "",
            url: s.url || "",
            source: s.source || "",
            author: s.author || "",
        })),
        createTime: new Date(c.createTime || c['create-time'] || new Date()),
        updateTime: new Date(c.updateTime || c['update-time'] || new Date()),
        externalLink: c.externalLink || "",
        platform: c.platform || "",
        isExpired: c['is-expired'] || false,
        // 运行时只有一个统一的Markdown内容字段
        descriptionMarkdown: c.descriptionMarkdown || c['description-markdown'] || "",
    }));
}; 