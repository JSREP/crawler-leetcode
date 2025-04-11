// 导入虚拟文件系统生成的数据
// @ts-ignore - 虚拟文件在构建时生成
import rawChallenges from '/virtual-challenges.js';
// 导入类型和解析函数
import { Challenge, parseChallenges } from '../../types/challenge';

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

// 使用虚拟文件系统数据
const yamlChallenges = Array.isArray(rawChallenges) ? rawChallenges : [];

// 优先使用YAML数据，如果为空则使用模拟数据
export const challenges: Challenge[] = yamlChallenges.length > 0 
    ? parseChallenges(yamlChallenges) 
    : parseChallenges(mockChallenges);

export type Solution = {
    title: string;
    url: string;
    source: string;
}; 