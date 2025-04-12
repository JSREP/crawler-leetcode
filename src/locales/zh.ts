const zhTranslations = {
    nav: {
        home: '首页',
        challenges: '挑战列表',
        about: '关于'
    },
    home: {
        hero: {
            title: '爬虫技术挑战合集',
            subtitle: '突破各种网站反爬机制，掌握先进爬虫技术，提升数据采集能力，成为爬虫工程师的不二之选',
            startButton: '开始挑战',
            learnMoreButton: '了解更多',
            stats: {
                totalChallenges: '总挑战数',
                easy: '初级',
                medium: '中级',
                hard: '高级',
                difficultyDistribution: '难度分布',
                ofTotal: '占总数'
            }
        },
        features: {
            title: '平台特色',
            items: [
                {
                    title: '爬虫挑战',
                    content: '探索各类爬虫技术难题，从基础数据提取到复杂反爬机制突破'
                },
                {
                    title: '技术分类',
                    content: '按照爬虫技术、目标网站和难度等多维度分类，快速定位学习重点'
                },
                {
                    title: '解决方案',
                    content: '查看详细的爬虫实现思路、代码示例和常见反爬绕过技巧'
                }
            ]
        },
        challenges: {
            recent: {
                title: '最新挑战',
                viewMore: '查看更多挑战'
            },
            popular: {
                title: '热门挑战',
                viewMore: '查看更多挑战'
            }
        }
    },
    about: {
        title: '关于爬虫挑战平台',
        description: '爬虫挑战平台致力于通过实际挑战帮助开发者掌握网络爬虫技术。',
        mission: {
            title: '我们的使命',
            content: '提供结构化的网络爬虫技术和反爬机制突破学习资源，帮助开发者提高数据采集能力。'
        },
        features: {
            title: '核心特点',
            items: [
                '适合不同技能水平的多样化爬虫挑战',
                '详细的解决方案和实现思路',
                '社区讨论和知识分享',
                '定期更新新的挑战和技术'
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
            github: 'GitHub',
            twitter: '推特'
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
    },
    challenge: {
        difficulty: {
            easy: '初级',
            medium: '中级',
            hard: '高级'
        },
        status: {
            completed: '已完成',
            inProgress: '进行中',
            notStarted: '未开始'
        },
        detail: {
            overview: '概述',
            requirements: '需求',
            hints: '提示',
            solution: '解决方案',
            discussions: '讨论',
            relatedChallenges: '相关挑战',
            technicalTags: '技术标签',
            targetWebsite: '目标网站',
            difficulty: '难度',
            created: '创建时间',
            updated: '更新时间',
            startChallenge: '开始挑战',
            viewSolution: '查看解决方案'
        }
    }
};

export default zhTranslations;