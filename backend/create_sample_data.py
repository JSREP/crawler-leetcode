#!/usr/bin/env python3
"""
创建示例数据脚本
"""
import os
import sys
import json
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import *


def create_sample_users():
    """创建示例用户"""
    print("👥 创建示例用户...")
    
    users_data = [
        {
            'github_id': 123456,
            'username': 'demo_user',
            'email': 'demo@example.com',
            'name': '演示用户',
            'role': 'user'
        },
        {
            'github_id': 789012,
            'username': 'admin_user',
            'email': 'admin@example.com',
            'name': '管理员',
            'role': 'admin'
        },
        {
            'github_id': 345678,
            'username': 'test_user',
            'email': 'test@example.com',
            'name': '测试用户',
            'role': 'user'
        }
    ]
    
    created_users = []
    
    for user_data in users_data:
        # 检查用户是否已存在
        existing_user = User.query.filter_by(github_id=user_data['github_id']).first()
        if existing_user:
            print(f"   用户已存在: {existing_user.username}")
            created_users.append(existing_user)
            continue
        
        user = User(
            github_id=user_data['github_id'],
            username=user_data['username'],
            email=user_data['email'],
            name=user_data['name'],
            role=user_data['role']
        )
        
        db.session.add(user)
        created_users.append(user)
        print(f"   创建用户: {user.username}")
    
    db.session.flush()  # 获取用户ID
    
    # 为每个用户创建存储配额
    for user in created_users:
        existing_quota = UserStorageQuota.query.filter_by(user_id=user.id).first()
        if not existing_quota:
            quota = UserStorageQuota(
                user_id=user.id,
                total_quota=104857600,  # 100MB
                used_quota=0,
                purchased_quota=0
            )
            db.session.add(quota)
            print(f"   创建配额: {user.username}")
    
    db.session.commit()
    print(f"✅ 成功创建/验证 {len(created_users)} 个用户")
    return created_users


def create_sample_challenges():
    """创建示例挑战"""
    print("\n🎯 创建示例挑战...")
    
    challenges_data = [
        {
            'id_alias': 'two-sum',
            'name': '两数之和',
            'name_en': 'Two Sum',
            'platform': 'leetcode',
            'difficulty_level': 1,
            'description_markdown': '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。',
            'description_markdown_en': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            'tags': json.dumps(['数组', '哈希表'])
        },
        {
            'id_alias': 'add-two-numbers',
            'name': '两数相加',
            'name_en': 'Add Two Numbers',
            'platform': 'leetcode',
            'difficulty_level': 2,
            'description_markdown': '给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。',
            'description_markdown_en': 'You are given two non-empty linked lists representing two non-negative integers.',
            'tags': json.dumps(['链表', '数学', '递归'])
        },
        {
            'id_alias': 'longest-substring',
            'name': '无重复字符的最长子串',
            'name_en': 'Longest Substring Without Repeating Characters',
            'platform': 'leetcode',
            'difficulty_level': 2,
            'description_markdown': '给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。',
            'description_markdown_en': 'Given a string s, find the length of the longest substring without repeating characters.',
            'tags': json.dumps(['哈希表', '字符串', '滑动窗口'])
        },
        {
            'id_alias': 'median-sorted-arrays',
            'name': '寻找两个正序数组的中位数',
            'name_en': 'Median of Two Sorted Arrays',
            'platform': 'leetcode',
            'difficulty_level': 4,
            'description_markdown': '给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出并返回这两个正序数组的中位数。',
            'description_markdown_en': 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
            'tags': json.dumps(['数组', '二分查找', '分治'])
        }
    ]
    
    created_challenges = []
    
    for challenge_data in challenges_data:
        # 检查挑战是否已存在
        existing_challenge = Challenge.query.filter_by(id_alias=challenge_data['id_alias']).first()
        if existing_challenge:
            print(f"   挑战已存在: {existing_challenge.name}")
            created_challenges.append(existing_challenge)
            continue
        
        challenge = Challenge(
            id_alias=challenge_data['id_alias'],
            name=challenge_data['name'],
            name_en=challenge_data['name_en'],
            platform=challenge_data['platform'],
            difficulty_level=challenge_data['difficulty_level'],
            description_markdown=challenge_data['description_markdown'],
            description_markdown_en=challenge_data['description_markdown_en'],
            base64_url='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            tags=challenge_data['tags']
        )
        
        db.session.add(challenge)
        created_challenges.append(challenge)
        print(f"   创建挑战: {challenge.name}")
    
    db.session.commit()
    print(f"✅ 成功创建/验证 {len(created_challenges)} 个挑战")
    return created_challenges


def create_sample_forum_posts(users, challenges):
    """创建示例论坛帖子"""
    print("\n💬 创建示例论坛帖子...")
    
    if not users or not challenges:
        print("   跳过：缺少用户或挑战数据")
        return []
    
    posts_data = [
        {
            'title': '两数之和的多种解法讨论',
            'content': '大家好，我想分享一下两数之和这道题的几种不同解法：\n\n1. 暴力解法：时间复杂度O(n²)\n2. 哈希表解法：时间复杂度O(n)\n\n欢迎大家讨论！',
            'challenge_id': challenges[0].id,
            'user_id': users[0].id
        },
        {
            'title': 'LeetCode刷题心得分享',
            'content': '最近在刷LeetCode，想和大家分享一些心得：\n\n- 先掌握基础数据结构\n- 多练习经典算法\n- 总结解题模板\n\n希望对新手有帮助！',
            'challenge_id': None,
            'user_id': users[1].id
        },
        {
            'title': '链表题目的通用技巧',
            'content': '链表是面试中的高频考点，这里总结几个通用技巧：\n\n1. 使用虚拟头节点\n2. 快慢指针技巧\n3. 递归思维\n\n大家还有什么好的技巧吗？',
            'challenge_id': challenges[1].id,
            'user_id': users[2].id
        }
    ]
    
    created_posts = []
    
    for post_data in posts_data:
        post = ForumPost(
            user_id=post_data['user_id'],
            challenge_id=post_data['challenge_id'],
            title=post_data['title'],
            content=post_data['content']
        )
        
        db.session.add(post)
        created_posts.append(post)
        print(f"   创建帖子: {post.title}")
    
    db.session.commit()
    print(f"✅ 成功创建 {len(created_posts)} 个论坛帖子")
    return created_posts


def create_sample_comments(users, challenges):
    """创建示例评论"""
    print("\n💭 创建示例评论...")
    
    if not users or not challenges:
        print("   跳过：缺少用户或挑战数据")
        return []
    
    comments_data = [
        {
            'challenge_id': challenges[0].id,
            'user_id': users[0].id,
            'content': '这道题用哈希表解法最优雅，时间复杂度O(n)，空间复杂度O(n)。'
        },
        {
            'challenge_id': challenges[0].id,
            'user_id': users[1].id,
            'content': '同意楼上，不过要注意边界情况的处理。'
        },
        {
            'challenge_id': challenges[1].id,
            'user_id': users[2].id,
            'content': '链表题目关键是要画图理解指针的移动过程。'
        }
    ]
    
    created_comments = []
    
    for comment_data in comments_data:
        comment = ChallengeComment(
            challenge_id=comment_data['challenge_id'],
            user_id=comment_data['user_id'],
            content=comment_data['content']
        )
        
        db.session.add(comment)
        created_comments.append(comment)
        print(f"   创建评论: {comment.content[:30]}...")
    
    db.session.commit()
    print(f"✅ 成功创建 {len(created_comments)} 个评论")
    return created_comments


def main():
    """主函数"""
    print("🚀 开始创建示例数据...\n")
    
    try:
        app = create_app()
        with app.app_context():
            # 创建示例数据
            users = create_sample_users()
            challenges = create_sample_challenges()
            posts = create_sample_forum_posts(users, challenges)
            comments = create_sample_comments(users, challenges)
            
            # 显示统计信息
            print(f"\n📊 数据创建完成:")
            print(f"   用户数: {User.query.count()}")
            print(f"   挑战数: {Challenge.query.count()}")
            print(f"   论坛帖子数: {ForumPost.query.count()}")
            print(f"   评论数: {ChallengeComment.query.count()}")
            print(f"   存储配额数: {UserStorageQuota.query.count()}")
            
            print(f"\n🎉 示例数据创建成功！")
            print(f"\n📋 现在可以测试:")
            print("1. 重新运行API测试: python test_api.py")
            print("2. 启动前端应用查看数据")
            
            return True
            
    except Exception as e:
        print(f"❌ 创建示例数据失败: {e}")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
