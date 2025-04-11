export type Solution = {
    title: string;
    url: string;
    source: string;
    author?: string;  // 添加作者字段
};

export type Challenge = {
    id: string;       // 唯一整数ID，保持string类型兼容现有代码
    idAlias?: string; // 唯一字符串别名，用于友好URL和显示
    number: number;
    title: string;
    description: string;
    difficulty: number;
    tags: string[];
    solutions: Solution[];
    createTime: Date;
    updateTime: Date;
    externalLink: string;
    platform?: string;  // 添加平台字段
    isExpired?: boolean;  // 添加链接失效状态字段
    descriptionMarkdown?: string;  // 添加Markdown描述字段
};

export const parseChallenges = (raw: any[]): Challenge[] => {
    if (!Array.isArray(raw)) {
        console.warn('Expected raw challenges to be an array, got:', typeof raw);
        return []; // 返回空数组避免错误
    }
    return raw.map(c => ({
        id: c.id || "",
        idAlias: c['id-alias'] || c.id || "", // 获取id-alias或使用id作为备选
        number: parseInt(c.number || "0", 10),
        title: c.title || c.name || "",
        description: c.description || "",
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
        descriptionMarkdown: c['description-markdown'] || "",
    }));
}; 