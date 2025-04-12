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
    name?: string;    // 默认中文标题（YAML中的标准字段）
    titleEN?: string; // 英文标题
    name_en?: string; // 英文标题（YAML中的标准字段）
    difficulty: number;
    tags: string[];
    solutions: Solution[];
    createTime: Date;
    updateTime: Date;
    externalLink: string;
    platform?: string;  // 添加平台字段
    isExpired?: boolean;  // 添加链接失效状态字段
    ignored?: boolean;  // 添加忽略标记字段
    descriptionMarkdown: string;  // 默认中文Markdown描述
    descriptionMarkdownEN?: string; // 英文Markdown描述
    sourceFile?: string;  // 源YAML文件路径
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
        
        // 确保title和name有值
        const name = c.name || c.title || "未命名挑战";
        const title = name; // 保持一致性
        
        // 获取英文标题
        const name_en = c.name_en || c['name_en'] || "";
        const titleEN = name_en; // 保持一致性
        
        console.log(`解析挑战: ID=${id}, 原始数据:`, {
            'c.name': c.name,
            'c.title': c.title,
            'c.name_en': c.name_en,
            'c["name_en"]': c['name_en'],
            '解析后name': name,
            '解析后title': title,
            '解析后name_en': name_en,
            '解析后titleEN': titleEN
        });
        
        // 获取描述内容，优先使用直接内容，其次是文件路径内容
        const descriptionMarkdown = c.descriptionMarkdown || c['description-markdown'] || "";
        
        // 获取英文描述内容，优先使用直接内容，其次是文件路径内容
        const descriptionMarkdownEN = c.descriptionMarkdownEN || c['description-markdown_en'] || "";
        
        // 解析difficulty字段，确保是一个1-5之间的数字
        let difficulty = 1; // 默认值
        if (c['difficulty-level'] !== undefined) {
            difficulty = parseInt(String(c['difficulty-level']), 10);
        } else if (c.difficulty !== undefined) {
            difficulty = parseInt(String(c.difficulty), 10);
        }
        
        // 确保值在1-5之间
        difficulty = Math.max(1, Math.min(5, difficulty));
        
        console.log(`解析难度: ID=${id}, difficulty=${difficulty}, 原始数据:`, {
            'c.difficulty': c.difficulty,
            'c["difficulty-level"]': c['difficulty-level'],
            '解析后difficulty': difficulty
        });
        
        return {
            id,
            idAlias: c['id-alias'] || c.id?.toString() || "", 
            number: parseInt(c.number || "0", 10),
            title,
            name,
            titleEN,
            name_en,
            difficulty: difficulty, // 使用正确解析的难度值
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
            ignored: c.ignored || false,
            descriptionMarkdown,
            descriptionMarkdownEN,
            sourceFile: c.sourceFile || ""
        };
    });
}; 