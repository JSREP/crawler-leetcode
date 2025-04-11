import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Input, List, Pagination, Select, Space, Tag, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined } from '@ant-design/icons';
import StarRating from './StarRating';
// 使用模拟数据代替插件导入
// import rawChallenges from '../plugins/VirtualFileSystemPlugin'; // 移除错误的导入

export type Solution = {
    title: string;
    url: string;
    source: string;
};

export type Challenge = {
    id: number;
    number: number;
    title: string;
    description: string;
    difficulty: number;
    tags: string[];
    solutions: Solution[];
    createTime: Date;
    updateTime: Date;
    externalLink: string;
};

const parseChallenges = (raw: any[]): Challenge[] => {
    if (!Array.isArray(raw)) {
        console.warn('Expected raw challenges to be an array, got:', typeof raw);
        return []; // 返回空数组避免错误
    }
    return raw.map(c => ({
        id: c.id,
        number: c.number,
        title: c.title,
        description: c.description,
        difficulty: c.difficulty,
        tags: c.tags,
        solutions: c.solutions,
        createTime: new Date(c.createTime),
        updateTime: new Date(c.updateTime),
        externalLink: c.externalLink
    }));
};

// 使用模拟数据代替实际数据
const mockChallenges = [
  {
    id: 1,
    number: 1,
    title: "两数之和",
    description: "给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。",
    difficulty: 1,
    tags: ["数组", "哈希表"],
    solutions: [],
    createTime: "2023-01-01T00:00:00.000Z",
    updateTime: "2023-01-01T00:00:00.000Z",
    externalLink: "https://leetcode.cn/problems/two-sum/"
  },
  {
    id: 2,
    number: 2,
    title: "两数相加",
    description: "给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。",
    difficulty: 2,
    tags: ["链表", "数学"],
    solutions: [],
    createTime: "2023-01-02T00:00:00.000Z",
    updateTime: "2023-01-02T00:00:00.000Z",
    externalLink: "https://leetcode.cn/problems/add-two-numbers/"
  },
  {
    id: 3,
    number: 3,
    title: "无重复字符的最长子串",
    description: "给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。",
    difficulty: 2,
    tags: ["哈希表", "字符串", "滑动窗口"],
    solutions: [],
    createTime: "2023-01-03T00:00:00.000Z",
    updateTime: "2023-01-03T00:00:00.000Z",
    externalLink: "https://leetcode.cn/problems/longest-substring-without-repeating-characters/"
  }
];

// 使用模拟数据
export const challenges: Challenge[] = parseChallenges(mockChallenges);

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const ChallengePage = () => {
    const {t} = useTranslation();
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tags: [] as string[],
    });
    const [sortBy, setSortBy] = useState('number');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({current: 1, pageSize: 10});
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleTagClick = (clickedTag: string) => {
        const currentSearchParams = new URLSearchParams(searchParams);
        const currentTags = currentSearchParams.getAll('tags');
        const newTags = currentTags.includes(clickedTag)
            ? currentTags.filter(t => t !== clickedTag)
            : [...currentTags, clickedTag];

        currentSearchParams.delete('tags');
        newTags.forEach(tag => currentSearchParams.append('tags', tag));
        navigate(`/challenges?${currentSearchParams.toString()}`);
    };

    const handleDifficultyClick = (difficulty: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('difficulty', difficulty);
        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    useEffect(() => {
        const tags = searchParams.getAll('tags');
        const difficulty = searchParams.get('difficulty') || 'all';
        setFilters(prev => ({...prev, tags, difficulty}));
    }, [searchParams]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        challenges.forEach(challenge => challenge.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, []);

    const filteredChallenges = useMemo(() => {
        return challenges
            .filter(challenge => {
                const matchesSearch = [challenge.title, challenge.description]
                    .some(text => text.toLowerCase().includes(searchQuery.toLowerCase()));

                const matchesDifficulty = filters.difficulty === 'all' ||
                    challenge.difficulty === parseInt(filters.difficulty);

                const matchesTags = filters.tags.length === 0 ||
                    filters.tags.every(tag => challenge.tags.includes(tag));

                return matchesSearch && matchesDifficulty && matchesTags;
            })
            .sort((a, b) => {
                const orderModifier = sortOrder === 'asc' ? 1 : -1;
                switch (sortBy) {
                    case 'number':
                        return (a.number - b.number) * orderModifier;
                    case 'difficulty':
                        return (a.difficulty - b.difficulty) * orderModifier;
                    case 'createTime':
                        return (a.createTime.getTime() - b.createTime.getTime()) * orderModifier;
                    case 'updateTime':
                        return (a.updateTime.getTime() - b.updateTime.getTime()) * orderModifier;
                    default:
                        return 0;
                }
            });
    }, [filters, searchQuery, sortBy, sortOrder]);

    const paginatedData = useMemo(() => {
        const start = (pagination.current - 1) * pagination.pageSize;
        return filteredChallenges.slice(start, start + pagination.pageSize);
    }, [filteredChallenges, pagination]);

    const handleFilterRemove = (type: 'tag' | 'difficulty', value?: string) => {
        const newSearchParams = new URLSearchParams(searchParams);

        if (type === 'tag' && value) {
            const newTags = filters.tags.filter(t => t !== value);
            newSearchParams.delete('tags');
            newTags.forEach(t => newSearchParams.append('tags', t));
        } else if (type === 'difficulty') {
            newSearchParams.delete('difficulty');
        }

        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    const handleClearAllFilters = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('tags');
        newSearchParams.delete('difficulty');
        navigate(`/challenges?${newSearchParams.toString()}`);
    };

    return (
        <div style={{
            padding: 24,
            maxWidth: '60%',
            margin: '0 auto',
            transition: 'all 0.3s ease'
        }}>
            <Space direction="vertical" style={{width: '100%'}}>
                {(filters.tags.length > 0 || filters.difficulty !== 'all') && (
                    <Space wrap style={{marginBottom: 16}}>
                        {filters.difficulty !== 'all' && (
                            <Tag
                                closable
                                onClose={() => handleFilterRemove('difficulty')}
                                style={{background: '#f0f5ff', borderColor: '#adc6ff'}}
                            >
                                难度: <StarRating difficulty={parseInt(filters.difficulty)} />
                            </Tag>
                        )}
                        {filters.tags.map(tag => (
                            <Tag
                                key={tag}
                                closable
                                onClose={() => handleFilterRemove('tag', tag)}
                                style={{background: '#f6ffed', borderColor: '#b7eb8f'}}
                            >
                                {tag}
                            </Tag>
                        ))}
                        <Button
                            type="text"
                            icon={<CloseOutlined/>}
                            onClick={handleClearAllFilters}
                            style={{color: '#ff4d4f'}}
                        >
                            清空所有
                        </Button>
                    </Space>
                )}

                <Space wrap>
                    <Select
                        mode="multiple"
                        placeholder="筛选标签"
                        style={{width: 200}}
                        value={filters.tags}
                        onChange={tags => {
                            const newSearchParams = new URLSearchParams(searchParams);
                            newSearchParams.delete('tags');
                            tags.forEach(tag => newSearchParams.append('tags', tag));
                            navigate(`/challenges?${newSearchParams.toString()}`);
                        }}
                        options={allTags.map(tag => ({label: tag, value: tag}))}
                    />

                    <Select
                        placeholder="选择难度"
                        style={{width: 140}}
                        value={filters.difficulty}
                        onChange={difficulty => handleDifficultyClick(difficulty)}
                    >
                        <Option value="all">全部难度</Option>
                        {[1, 2, 3, 4, 5].map(n => (
                            <Option key={n} value={String(n)}>
                                <StarRating difficulty={n} />
                            </Option>
                        ))}
                    </Select>

                    <Select
                        value={sortBy}
                        style={{width: 120}}
                        onChange={value => setSortBy(value)}
                    >
                        <Option value="number">编号排序</Option>
                        <Option value="difficulty">难度排序</Option>
                        <Option value="createTime">创建时间</Option>
                        <Option value="updateTime">更新时间</Option>
                    </Select>

                    <Button
                        icon={sortOrder === 'asc' ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    />

                    <Search
                        placeholder="搜索题目"
                        allowClear
                        style={{width: 200}}
                        onSearch={value => setSearchQuery(value)}
                    />
                </Space>

                <List
                    grid={{gutter: 16, column: 1}}
                    dataSource={paginatedData}
                    renderItem={challenge => (
                        <List.Item>
                            <Card
                                hoverable
                                onClick={() => navigate(`/challenge/${challenge.id}`)}
                                style={{cursor: 'pointer'}}
                            >
                                <Space direction="vertical" style={{width: '100%'}}>
                                    <Space>
                                        <Tag color="#42b983">{challenge.number}</Tag>
                                        <Text strong style={{fontSize: 16}}>{challenge.title}</Text>
                                    </Space>

                                    <Text type="secondary">{challenge.description}</Text>

                                    <Space wrap>
                                        <StarRating
                                            difficulty={challenge.difficulty}
                                            onClick={(difficulty) => handleDifficultyClick(String(difficulty))}
                                        />
                                        {challenge.tags.map(tag => (
                                            <Tag
                                                key={tag}
                                                color={filters.tags.includes(tag) ? 'geekblue' : 'blue'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTagClick(tag);
                                                }}
                                                style={{cursor: 'pointer'}}
                                            >
                                                {tag}
                                            </Tag>
                                        ))}
                                        <Text type="secondary">
                                            创建时间: {challenge.createTime.toLocaleDateString()}
                                        </Text>
                                        <Text type="secondary">
                                            更新时间: {challenge.updateTime.toLocaleDateString()}
                                        </Text>
                                    </Space>

                                    <div style={{marginTop: 12}}>
                                        <Button
                                            type="link"
                                            href={challenge.externalLink}
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            去试试 ➔
                                        </Button>
                                    </div>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />

                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={filteredChallenges.length}
                    showSizeChanger
                    onChange={(page, pageSize) => setPagination({current: page, pageSize})}
                    style={{marginTop: 24, textAlign: 'center'}}
                />
            </Space>
        </div>
    );
};

export default ChallengePage;