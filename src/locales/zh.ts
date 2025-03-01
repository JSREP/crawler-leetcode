export default {
    nav: {
        home: '首页',
        challenges: '挑战',
        about: '关于'
    },
    about: {
        title: '关于 LeetCode 爬虫工具',
        description: 'LeetCode 爬虫工具是一个帮助程序员整理和管理 LeetCode 编程挑战的平台。我们的目标是让刷题更加高效和有组织。',
        features: {
            title: '项目特点',
            list: [
                '完整收录 LeetCode 题库，包含详细的题目描述和难度分级',
                '提供多种筛选和排序功能，帮助您找到适合的题目',
                '收集优质题解和参考资料，提高解题效率',
                '定期更新题库，确保内容的时效性'
            ]
        },
        techStack: {
            title: '技术栈',
            list: [
                '前端框架：React + TypeScript',
                'UI 组件库：Ant Design',
                '状态管理：React Hooks',
                '数据获取：REST API + Axios'
            ]
        },
        contact: {
            title: '联系我们',
            email: '邮箱',
            loading: '加载中...'
        }
    },
    challenges: {
        filters: {
            tags: '标签筛选',
            difficulty: '难度筛选',
            allDifficulties: '所有难度',
            search: '搜索挑战...'
        },
        sort: {
            number: '题号',
            difficulty: '难度',
            createTime: '创建时间',
            updateTime: '修改时间'
        },
        dates: {
            created: '创建',
            updated: '更新'
        }
    }
}