const zhTranslations = {
    nav: {
        home: '首页',
        challenges: '挑战列表',
        about: '关于',
        user: '用户',
        system: '系统',
        contribute: '贡献题目'
    },
    titles: {
        home: '首页 - 爬虫技术挑战平台',
        challenges: '挑战列表 - 爬虫技术挑战平台',
        about: '关于 - 爬虫技术挑战平台',
        contribute: '贡献题目 - 爬虫技术挑战平台',
        challenge: '挑战详情 - 爬虫技术挑战平台',
        default: '爬虫技术挑战平台'
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
                    title: '参考资料',
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
        title: '挑战列表',
        filters: {
            tags: '标签筛选',
            difficulty: '难度筛选',
            allDifficulties: '所有难度',
            allPlatforms: '所有平台',
            search: '搜索挑战...',
            clearAll: '清空所有',
            clearAllShort: '清空',
            searchTags: '搜索标签...'
        },
        sort: {
            number: '题号',
            difficulty: '难度',
            createTime: '创建时间',
            updateTime: '修改时间'
        },
        dates: {
            created: '创建',
            updated: '更新',
            createdShort: '创建',
            updatedShort: '更新'
        },
        controls: {
            sortBy: '排序方式',
            ascending: '升序',
            descending: '降序',
            platform: '平台筛选',
            filter: '筛选',
            filterAndSort: '筛选与排序'
        },
        empty: {
            title: '未找到挑战',
            description: '请尝试调整搜索或筛选条件'
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
            targetWebsite: '平台',
            platform: '平台',
            difficulty: '难度级别',
            created: '创建时间',
            updated: '更新时间',
            originalLink: '原始链接',
            startChallenge: '去试试',
            startChallengeShort: '试试',
            viewSolution: '查看参考资料',
            tags: '标签',
            description: '问题描述',
            solutions: '参考资料',
            viewSolutionLink: '查看资料',
            noSolutions: '暂无参考资料',
            contributeSolution: '贡献你的参考资料',
            contributeTip: '欢迎分享你的参考资料，帮助更多的人！',
            referencesExplanation: '参考资料为外部链接，包括教程、技术文章和代码示例等，提供学习和参考用途，不提供直接的破解方案。',
            source: '来源',
            author: '作者',
            correction: '纠错',
            correctionTooltip: '感觉内容可以优化甚至有错误？别犹豫点此去GitHub提PR',
            reportIssue: '反馈问题',
            issueTooltip: '遇到问题？点此提交GitHub Issue',
            backToList: '返回挑战列表',
            unspecified: '未指定'
        },
        actions: {
            backToList: '返回挑战列表'
        },
        platforms: {
            Web: 'Web网站',
            Android: 'Android应用',
            iOS: 'iOS应用',
            'WeChat-MiniProgram': '微信小程序',
            'Electron': 'Electron应用',
            'Windows-Native': 'Windows原生',
            'Mac-Native': 'Mac原生',
            'Linux-Native': 'Linux原生'
        },
        pagination: {
            previous: '上一题',
            next: '下一题',
            leftKeyHint: '键盘左方向键 ←',
            rightKeyHint: '键盘右方向键 →'
        },
        expired: {
            title: '警告：此挑战题目链接已失效',
            description: '该链接可能已经被移除或已更改。请尝试搜索最新版本或联系管理员更新此题目。',
            linkStatus: '链接已失效'
        },
        error: {
            notFound: '未找到挑战',
            loadFailed: '加载挑战失败'
        }
    },
    search: {
        recentSearches: '最近搜索',
        clear: '清除',
        tooltip: {
            title: '高级搜索提示：',
            allFields: '搜索题目标题、描述、标签等所有字段',
            fuzzySearch: '支持模糊搜索和拼写容错',
            multiKeywords: {
                text: '多关键词',
                example: '动态规划 数组'
            },
            exactMatch: {
                text: '精确匹配',
                example: '=动态规划'
            },
            exclude: {
                text: '排除词',
                example: '!二叉树'
            },
            prefix: {
                text: '前缀匹配',
                example: '链^'
            },
            idSearch: '直接输入题号进行搜索'
        }
    },
    common: {
        loading: '加载中...'
    },
    tagTooltips: {
        filterByTag: '点击可按此标签筛选题目',
        filterByDifficulty: '点击可按此难度筛选题目',
        filterByPlatform: '点击可按此平台筛选题目'
    },
    user: '用户',
    system: '系统',
    contribute: '贡献题目'
};

export default zhTranslations;