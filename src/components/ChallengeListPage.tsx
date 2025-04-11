import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button, Card, Input, List, Pagination, Select, Space, Tag, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined } from '@ant-design/icons';
import StarRating from './StarRating';
// 导入虚拟文件系统生成的数据
// @ts-ignore - 虚拟文件在构建时生成
import rawChallenges from '/virtual-challenges.js';
// 导入类型和解析函数
import { Challenge, parseChallenges } from '../types/challenge';

// 使用虚拟文件系统数据
const yamlChallenges = Array.isArray(rawChallenges) ? rawChallenges : [];

// 回退到模拟数据（如果YAML加载失败）
const mockChallenges = [
  {
    id: "1",
    number: 1,
    title: "两数之和",
    description: "给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。",
    difficulty: 1,
    tags: ["数组", "哈希表"],
    solutions: [],
    createTime: "2023-01-01T00:00:00.000Z",
    updateTime: "2023-01-01T00:00:00.000Z",
    externalLink: "https://leetcode.cn/problems/two-sum/",
    platform: "Web",
    isExpired: false,
    descriptionMarkdown: ""
  },
  {
    id: "2",
    number: 2,
    title: "两数相加",
    description: "给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。",
    difficulty: 2,
    tags: ["链表", "数学"],
    solutions: [],
    createTime: "2023-01-02T00:00:00.000Z",
    updateTime: "2023-01-02T00:00:00.000Z",
    externalLink: "https://leetcode.cn/problems/add-two-numbers/",
    platform: "Web",
    isExpired: false,
    descriptionMarkdown: ""
  },
  {
    id: "3",
    number: 3,
    title: "无重复字符的最长子串",
    description: "给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。",
    difficulty: 2,
    tags: ["哈希表", "字符串", "滑动窗口"],
    solutions: [],
    createTime: "2023-01-03T00:00:00.000Z",
    updateTime: "2023-01-03T00:00:00.000Z",
    externalLink: "https://leetcode.cn/problems/longest-substring-without-repeating-characters/",
    platform: "Web",
    isExpired: false,
    descriptionMarkdown: ""
  }
];

// 优先使用YAML数据，如果为空则使用模拟数据
export const challenges: Challenge[] = yamlChallenges.length > 0 
    ? parseChallenges(yamlChallenges) 
    : parseChallenges(mockChallenges);

export type Solution = {
    title: string;
    url: string;
    source: string;
};

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

/**
 * 简单挑战列表组件
 * 用于在首页等地方显示简略版挑战列表
 * 
 * @param {Object} props - 组件属性
 * @param {Challenge[]} props.challenges - 要显示的挑战数组
 * @param {string} [props.title="挑战列表"] - 列表标题
 * @returns {JSX.Element} 挑战列表组件
 */
export const SimpleChallengeList = ({ 
    challenges, 
    title = "挑战列表" 
}: { 
    challenges: Challenge[], 
    title?: string 
}) => {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>{title}</Title>
            {challenges.map((challenge) => (
                <Card 
                    key={challenge.id} 
                    style={{ width: '100%' }}
                    hoverable
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Text strong>{challenge.number}. {challenge.title}</Text>
                            <div style={{ marginTop: 4 }}>
                                <StarRating difficulty={challenge.difficulty} />
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    {challenge.tags.join(', ')}
                                </Text>
                            </div>
                        </div>
                        <Link to={`/challenge/${challenge.id}`}>
                            查看详情
                        </Link>
                    </div>
                </Card>
            ))}
        </Space>
    );
};

/**
 * 挑战列表页面组件
 * 展示所有挑战，支持过滤、排序和搜索
 */
const ChallengeListPage = () => {
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
        challenges.forEach((challenge: Challenge) => challenge.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags);
    }, []);

    const filteredChallenges = useMemo(() => {
        return challenges
            .filter((challenge: Challenge) => {
                const matchesSearch = [challenge.title, challenge.description]
                    .some(text => text.toLowerCase().includes(searchQuery.toLowerCase()));

                const matchesDifficulty = filters.difficulty === 'all' ||
                    challenge.difficulty === parseInt(filters.difficulty);

                const matchesTags = filters.tags.length === 0 ||
                    filters.tags.every(tag => challenge.tags.includes(tag));

                return matchesSearch && matchesDifficulty && matchesTags;
            })
            .sort((a: Challenge, b: Challenge) => {
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
                        onChange={(tags: string[]) => {
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
                        onSearch={(value: string) => setSearchQuery(value)}
                    />
                </Space>

                <List
                    grid={{gutter: 16, column: 1}}
                    dataSource={paginatedData}
                    renderItem={(challenge: Challenge) => (
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
                                                onClick={(e: React.MouseEvent) => {
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
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
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

export default ChallengeListPage; 