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
    title: string;    // 默认中文标题
    titleEN?: string; // 英文标题
    difficulty: number;
    tags: string[];
    solutions: Solution[];
    createTime: Date;
    updateTime: Date;
    externalLink: string;
    platform?: string;  // 添加平台字段
    isExpired?: boolean;  // 添加链接失效状态字段
    descriptionMarkdown: string;  // 默认中文Markdown描述
    descriptionMarkdownEN?: string; // 英文Markdown描述
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
        
        // 确保title有值，优先使用name字段
        const title = c.name || c.title || "未命名挑战";
        // 获取英文标题
        const titleEN = c.name_en || "";
        
        console.log(`解析挑战: ID=${id}, Title=${title}`);
        
        // 获取描述内容，优先使用直接内容，其次是文件路径内容
        const descriptionMarkdown = c.descriptionMarkdown || c['description-markdown'] || "";
        
        // 获取英文描述内容，优先使用直接内容，其次是文件路径内容
        const descriptionMarkdownEN = c['description-markdown_en'] || "";
        
        return {
            id,
            idAlias: c['id-alias'] || c.id?.toString() || "", 
            number: parseInt(c.number || "0", 10),
            title,
            titleEN,
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
            descriptionMarkdown,
            descriptionMarkdownEN,
        };
    });
}; 