export default {
    nav: {
        home: 'Home',
        challenges: 'Challenges',
        about: 'About'
    },
    home: {
        hero: {
            title: 'Web Crawler Challenge Collection',
            subtitle: 'Break through various website anti-crawler mechanisms, master advanced crawling techniques, enhance data collection capabilities, and become the go-to crawler engineer',
            startButton: 'Start Challenge',
            learnMoreButton: 'Learn More',
            stats: {
                totalChallenges: 'Total Challenges',
                easy: 'Basic',
                medium: 'Intermediate',
                hard: 'Advanced',
                difficultyDistribution: 'Difficulty Distribution',
                ofTotal: 'of total challenges'
            }
        },
        features: {
            title: 'Platform Features',
            items: [
                {
                    title: 'Crawler Challenges',
                    content: 'Explore various web crawling technical problems, from basic data extraction to complex anti-crawler mechanism breakthroughs'
                },
                {
                    title: 'Technical Categories',
                    content: 'Categorized by crawling techniques, target websites, and difficulty levels for quick learning focus'
                },
                {
                    title: 'Solution Approaches',
                    content: 'View detailed crawler implementation ideas, code examples, and common anti-crawler bypass techniques'
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
        title: 'About Crawler LeetCode',
        description: 'Crawler LeetCode is a platform dedicated to helping developers master web crawling techniques through practical challenges.',
        mission: {
            title: 'Our Mission',
            content: 'To provide structured learning resources for web crawling techniques and anti-crawler mechanism breakthroughs, helping developers improve their data collection capabilities.'
        },
        features: {
            title: 'Key Features',
            items: [
                'Diverse crawling challenges for different skill levels',
                'Detailed solutions and implementation ideas',
                'Community discussions and knowledge sharing',
                'Regular updates with new challenges and techniques'
            ]
        },
        techStack: {
            title: 'Tech Stack',
            list: [
                'Frontend Framework: React + TypeScript',
                'UI Component Library: Ant Design',
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
        filters: {
            tags: 'Filter by tags',
            difficulty: 'Filter by difficulty',
            allDifficulties: 'All difficulties',
            allPlatforms: 'All platforms',
            search: 'Search challenges...',
            clearAll: 'Clear all'
        },
        sort: {
            number: 'Problem No.',
            difficulty: 'Difficulty',
            createTime: 'Create Time',
            updateTime: 'Update Time'
        },
        dates: {
            created: 'Created',
            updated: 'Updated'
        },
        controls: {
            sortBy: 'Sort by',
            ascending: 'Ascending order',
            descending: 'Descending order',
            platform: 'Platform'
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
            viewSolution: 'View Solution',
            tags: 'Tags',
            description: 'Problem Description',
            solutions: 'Reference Solutions',
            viewSolutionLink: 'View Solution',
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