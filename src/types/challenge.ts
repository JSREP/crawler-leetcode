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
    
    console.log(`解析${raw.length}个挑战数据...`);
    
    return raw.map(c => {
        // 解析ID，确保它是一个数字
        const id = parseInt(c.id || "0", 10);
        
        // 确保title有值
        const title = c.title || c.name || "未命名挑战";
        
        console.log(`解析挑战: ID=${id}, Title=${title}`);
        
        return {
            id,
            idAlias: c['id-alias'] || c.id?.toString() || "", 
            number: parseInt(c.number || "0", 10),
            title,
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
            descriptionMarkdown: c.descriptionMarkdown || c['description-markdown'] || "",
        };
    });
}; 