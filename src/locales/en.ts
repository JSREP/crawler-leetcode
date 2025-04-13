export default {
    nav: {
        home: 'Home',
        challenges: 'Challenges',
        about: 'About',
        user: 'User',
        system: 'System',
        contribute: 'Contribute'
    },
    titles: {
        home: 'Home - Web Crawler Challenge Platform',
        challenges: 'Challenges - Web Crawler Challenge Platform',
        about: 'About - Web Crawler Challenge Platform',
        challenge: 'Challenge - Web Crawler Challenge Platform',
        contribute: 'Contribute - Web Crawler Challenge Platform',
        default: 'Web Crawler Challenge Platform'
    },
    home: {
        hero: {
            title: 'Web Crawler Challenges',
            subtitle: 'Master web crawling techniques, overcome anti-bot mechanisms, and develop your data extraction skills with our curated challenges',
            startButton: 'Start Challenges',
            learnMoreButton: 'Learn More',
            stats: {
                totalChallenges: 'Total Challenges',
                easy: 'Basic',
                medium: 'Intermediate',
                hard: 'Advanced',
                difficultyDistribution: 'Difficulty Distribution',
                ofTotal: 'of total'
            }
        },
        features: {
            title: 'Platform Features',
            items: [
                {
                    title: 'Crawler Challenges',
                    content: 'Explore diverse crawling techniques from basic data extraction to complex anti-bot bypassing'
                },
                {
                    title: 'Classified By Technique',
                    content: 'Find challenges organized by crawling technique, target website, and difficulty level'
                },
                {
                    title: 'Solution Guidance',
                    content: 'Access detailed implementation strategies, code examples, and anti-detection techniques'
                }
            ]
        },
        challenges: {
            recent: {
                title: 'Recent Challenges',
                viewMore: 'View More Challenges'
            },
            popular: {
                title: 'Popular Challenges',
                viewMore: 'View More Challenges'
            }
        }
    },
    about: {
        title: 'About the Web Crawler Challenge Platform',
        description: 'The Web Crawler Challenge Platform is dedicated to helping developers master web crawling techniques through practical challenges.',
        mission: {
            title: 'Our Mission',
            content: 'To provide structured learning resources for web crawling techniques and anti-bot bypassing strategies, helping developers improve their data collection capabilities.'
        },
        features: {
            title: 'Core Features',
            items: [
                'Diverse crawler challenges suitable for different skill levels',
                'Detailed solutions and implementation strategies',
                'Community discussions and knowledge sharing',
                'Regular updates with new challenges and techniques'
            ]
        },
        techStack: {
            title: 'Tech Stack',
            list: [
                'Frontend: React + TypeScript',
                'UI Components: Ant Design',
                'State Management: React Hooks',
                'Data Fetching: REST API + Axios'
            ]
        },
        contact: {
            title: 'Contact Us',
            email: 'Email',
            github: 'GitHub',
            twitter: 'Twitter'
        }
    },
    challenges: {
        title: 'Challenge List',
        filters: {
            tags: 'Filter by Tags',
            difficulty: 'Filter by Difficulty',
            allDifficulties: 'All Difficulties',
            allPlatforms: 'All Platforms',
            search: 'Search challenges...',
            clearAll: 'Clear All',
            clearAllShort: 'Clear',
            searchTags: 'Search tags...'
        },
        sort: {
            number: 'Problem No.',
            difficulty: 'Difficulty',
            createTime: 'Create Time',
            updateTime: 'Update Time'
        },
        dates: {
            created: 'Created',
            updated: 'Updated',
            createdShort: 'Created',
            updatedShort: 'Updated'
        },
        controls: {
            sortBy: 'Sort by',
            ascending: 'Ascending order',
            descending: 'Descending order',
            platform: 'Platform',
            filter: 'Filter',
            filterAndSort: 'Filter & Sort'
        },
        empty: {
            title: 'No challenges found',
            description: 'Try adjusting your search or filter criteria'
        }
    },
    challenge: {
        difficulty: {
            easy: 'Basic',
            medium: 'Intermediate',
            hard: 'Advanced'
        },
        status: {
            completed: 'Completed',
            inProgress: 'In Progress',
            notStarted: 'Not Started'
        },
        detail: {
            overview: 'Overview',
            requirements: 'Requirements',
            hints: 'Hints',
            solution: 'Solution',
            discussions: 'Discussions',
            relatedChallenges: 'Related Challenges',
            technicalTags: 'Technical Tags',
            targetWebsite: 'Target Website',
            difficulty: 'Difficulty',
            created: 'Created',
            updated: 'Updated',
            startChallenge: 'Try It',
            startChallengeShort: 'Try',
            viewSolution: 'View Solution',
            tags: 'Tags',
            description: 'Problem Description',
            solutions: 'Reference Solutions',
            viewSolutionLink: 'View Solution',
            noSolutions: 'No solution available',
            contributeSolution: 'Contribute Your Solution',
            contributeTip: 'Share your solution and help others!',
            source: 'Source',
            author: 'Author',
            correction: 'Correction',
            correctionTooltip: 'Think the content could be improved or has errors? Don\'t hesitate to submit a PR on GitHub',
            reportIssue: 'Report Issue',
            issueTooltip: 'Having a problem? Click to submit a GitHub Issue'
        },
        actions: {
            backToList: 'Back to Challenge List'
        },
        pagination: {
            previous: 'Previous',
            next: 'Next',
            leftKeyHint: 'Left Arrow Key ←',
            rightKeyHint: 'Right Arrow Key →'
        },
        expired: {
            title: 'Warning: This challenge link has expired',
            description: 'The link may have been removed or changed. Please try searching for the latest version or contact the administrator to update this challenge.',
            linkStatus: 'Link expired'
        },
        error: {
            notFound: 'Challenge not found',
            loadFailed: 'Failed to load challenge'
        }
    },
    search: {
        recentSearches: 'Recent searches',
        clear: 'Clear',
        tooltip: {
            title: 'Advanced Search Tips:',
            allFields: 'Search challenge title, description, tags and all fields',
            fuzzySearch: 'Supports fuzzy search and spelling tolerance',
            multiKeywords: {
                text: 'Multiple keywords',
                example: 'dynamic array'
            },
            exactMatch: {
                text: 'Exact match',
                example: '=dynamic'
            },
            exclude: {
                text: 'Exclude words',
                example: '!binary tree'
            },
            prefix: {
                text: 'Prefix match',
                example: 'link^'
            },
            idSearch: 'Directly enter challenge ID to search'
        }
    },
    common: {
        loading: 'Loading...'
    },
    tagTooltips: {
        filterByTag: 'Click to filter challenges by this tag',
        filterByDifficulty: 'Click to filter challenges by this difficulty level',
        filterByPlatform: 'Click to filter challenges by this platform'
    }
}