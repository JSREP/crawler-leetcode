export default {
    nav: {
        home: 'Home',
        challenges: 'Challenges',
        about: 'About'
    },
    about: {
        title: 'About LeetCode Crawler',
        description: 'LeetCode Crawler is a platform that helps programmers organize and manage LeetCode programming challenges. Our goal is to make problem-solving more efficient and organized.',
        features: {
            title: 'Features',
            list: [
                'Complete collection of LeetCode problems with detailed descriptions and difficulty levels',
                'Various filtering and sorting functions to help you find suitable problems',
                'Collection of high-quality solutions and reference materials to improve solving efficiency',
                'Regular updates to ensure content timeliness'
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
            loading: 'Loading...'
        }
    },
    challenges: {
        filters: {
            tags: 'Filter by tags',
            difficulty: 'Filter by difficulty',
            allDifficulties: 'All difficulties',
            search: 'Search challenges...'
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
        }
    }
}