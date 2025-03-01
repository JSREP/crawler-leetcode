import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Button, Card, Input, List, message, Pagination, Select, Space, Tag, Typography,} from 'antd';
import {ArrowDownOutlined, ArrowUpOutlined, CloseOutlined, StarFilled} from '@ant-design/icons';

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
};

const {Search} = Input;
const {Option} = Select;
const {Text} = Typography;

const generateMockData = (count: number): Challenge[] => {
    const tagsPool = ['JavaScript', 'React', 'WebSocket', '算法', '逆向', '网络', 'Node.js', 'TypeScript'];
    const sources = ['LeetCode官方', '社区贡献', 'GitHub精选', '个人博客'];

    return Array.from({length: count}, (_, i) => {
        const baseDate = new Date();
        const createDate = new Date(baseDate.setMonth(baseDate.getMonth() - Math.random() * 24));
        const updateDate = new Date(createDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

        return {
            id: i + 1,
            number: i + 1,
            title: `编程挑战题目 #${i + 1}`,
            description: `这是用于测试分页功能的第${i + 1}个题目，包含多种算法场景的模拟数据。通过这个题目可以练习数据结构和网络协议相关技能。`,
            difficulty: Math.floor(Math.random() * 3) + 1,
            tags: Array.from({length: Math.floor(Math.random() * 3) + 1}, () =>
                tagsPool[Math.floor(Math.random() * tagsPool.length)]
            ),
            solutions: Array.from({length: Math.floor(Math.random() * 3) + 1}, (_, j) => ({
                title: `解决方案 ${j + 1}`,
                url: `<url id="cv1cjqvpma9i7s5ab6t0" type="url" status="failed" title="" wc="0">https://example.com/solution/</url> ${i}-${j}`,
                source: sources[Math.floor(Math.random() * sources.length)]
            })),
            createTime: createDate,
            updateTime: Math.random() > 0.5 ? updateDate : createDate
        };
    });
};

export const challenges: Challenge[] = generateMockData(500);

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

    const handleShare = (challenge: Challenge) => {
        const shareText = `【${challenge.title}】\n 🌟学习地址: ${window.location.origin}/challenge/${challenge.id}`;
        navigator.clipboard
            .writeText(shareText)
            .then(() => {
                message.success('已复制到剪切板');
            })
            .catch(() => {
                message.error('复制失败，请重试');
            });
    };

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
                {/* 筛选条件展示区域 */}
                {(filters.tags.length > 0 || filters.difficulty !== 'all') && (
                    <Space wrap style={{marginBottom: 16}}>
                        {filters.difficulty !== 'all' && (
                            <Tag
                                closable
                                onClose={() => handleFilterRemove('difficulty')}
                                style={{background: '#f0f5ff', borderColor: '#adc6ff'}}
                            >
                                难度: {'★'.repeat(parseInt(filters.difficulty))}
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
                        placeholder={t('challenges.filters.tags')}
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
                        placeholder={t('challenges.filters.difficulty')}
                        style={{width: 120}}
                        value={filters.difficulty}
                        onChange={difficulty => {
                            const newSearchParams = new URLSearchParams(searchParams);
                            newSearchParams.set('difficulty', difficulty);
                            navigate(`/challenges?${newSearchParams.toString()}`);
                        }}
                    >
                        <Option value="all">{t('challenges.filters.allDifficulties')}</Option>
                        <Option value="1">★</Option>
                        <Option value="2">★★</Option>
                        <Option value="3">★★★</Option>
                    </Select>

                    <Select
                        value={sortBy}
                        style={{width: 120}}
                        onChange={value => setSortBy(value)}
                    >
                        <Option value="number">{t('challenges.sort.number')}</Option>
                        <Option value="difficulty">{t('challenges.sort.difficulty')}</Option>
                        <Option value="createTime">{t('challenges.sort.createTime')}</Option>
                        <Option value="updateTime">{t('challenges.sort.updateTime')}</Option>
                    </Select>

                    <Button
                        icon={sortOrder === 'asc' ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    />

                    <Search
                        placeholder={t('challenges.filters.search')}
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
                                        <Tag icon={<StarFilled/>} color="gold">
                                            {'★'.repeat(challenge.difficulty)}
                                        </Tag>
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
                                            {t('challenges.dates.created')}: {challenge.createTime.toLocaleDateString()}
                                        </Text>
                                        <Text type="secondary">
                                            {t('challenges.dates.updated')}: {challenge.updateTime.toLocaleDateString()}
                                        </Text>
                                    </Space>
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