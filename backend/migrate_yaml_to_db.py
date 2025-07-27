#!/usr/bin/env python3
"""
将 YAML 文件数据迁移到 PostgreSQL 数据库
"""
import os
import sys
import yaml
import json
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db_manager, init_database

def load_yaml_files(challenges_dir):
    """加载所有 YAML 文件"""
    challenges_data = []
    challenges_path = Path(challenges_dir)
    
    if not challenges_path.exists():
        print(f"❌ 挑战目录不存在: {challenges_dir}")
        return challenges_data
    
    print(f"📁 扫描目录: {challenges_dir}")
    
    # 递归查找所有 YAML 文件
    yaml_files = list(challenges_path.rglob("*.yml")) + list(challenges_path.rglob("*.yaml"))
    
    print(f"📄 找到 {len(yaml_files)} 个 YAML 文件")
    
    for yaml_file in yaml_files:
        try:
            print(f"📖 读取文件: {yaml_file}")
            
            with open(yaml_file, 'r', encoding='utf-8') as file:
                content = file.read()
                
                # 解析 YAML 内容
                data = yaml.safe_load(content)

                if data and 'challenges' in data:
                    # 处理嵌套的 challenges 数组
                    for challenge in data['challenges']:
                        # 添加源文件信息
                        challenge['source_file'] = str(yaml_file.relative_to(challenges_path))
                        challenges_data.append(challenge)
                        print(f"  ✅ 成功解析: {challenge.get('name', '未知挑战')}")
                elif data:
                    # 处理单个挑战文件
                    data['source_file'] = str(yaml_file.relative_to(challenges_path))
                    challenges_data.append(data)
                    print(f"  ✅ 成功解析: {data.get('name', '未知挑战')}")
                else:
                    print(f"  ⚠️  文件为空: {yaml_file}")
                    
        except yaml.YAMLError as e:
            print(f"  ❌ YAML 解析错误 {yaml_file}: {e}")
        except Exception as e:
            print(f"  ❌ 文件读取错误 {yaml_file}: {e}")
    
    print(f"🎯 总共加载了 {len(challenges_data)} 个挑战")
    return challenges_data

def transform_challenge_data(yaml_data):
    """转换 YAML 数据为数据库格式"""
    try:
        # 基础字段映射，处理带连字符的字段名
        challenge = {
            'id_alias': yaml_data.get('id-alias') or yaml_data.get('id_alias') or str(yaml_data.get('id', '')),
            'name': yaml_data.get('name', ''),
            'name_en': yaml_data.get('name_en') or yaml_data.get('name-en', ''),
            'platform': yaml_data.get('platform', ''),
            'difficulty_level': int(yaml_data.get('difficulty-level') or yaml_data.get('difficulty_level', 0)),
            'description_markdown': yaml_data.get('description-markdown') or yaml_data.get('description_markdown', ''),
            'description_markdown_en': yaml_data.get('description-markdown_en') or yaml_data.get('description_markdown_en', ''),
            'base64_url': yaml_data.get('base64-url') or yaml_data.get('base64_url', ''),
            'is_expired': bool(yaml_data.get('is-expired') or yaml_data.get('is_expired', False)),
            'tags': yaml_data.get('tags', [])
        }
        
        # 验证必需字段
        if not challenge['id_alias']:
            raise ValueError("缺少 id_alias 字段")
        if not challenge['name']:
            raise ValueError("缺少 name 字段")
        if not challenge['platform']:
            raise ValueError("缺少 platform 字段")
        if not challenge['base64_url']:
            raise ValueError("缺少 base64_url 字段")
        
        return challenge
        
    except Exception as e:
        print(f"❌ 数据转换失败: {e}")
        print(f"   原始数据: {yaml_data}")
        return None

def migrate_challenges_to_db(challenges_data):
    """将挑战数据迁移到数据库"""
    if not challenges_data:
        print("⚠️  没有数据需要迁移")
        return
    
    db = get_db_manager()
    success_count = 0
    error_count = 0
    
    print(f"🚀 开始迁移 {len(challenges_data)} 个挑战到数据库...")
    
    for i, yaml_data in enumerate(challenges_data, 1):
        try:
            print(f"\n📝 [{i}/{len(challenges_data)}] 处理挑战: {yaml_data.get('name', '未知')}")
            
            # 转换数据格式
            challenge = transform_challenge_data(yaml_data)
            
            if challenge is None:
                error_count += 1
                continue
            
            # 插入数据库
            challenge_id = db.insert_challenge(challenge)
            
            if challenge_id:
                print(f"   ✅ 成功插入，ID: {challenge_id}")
                success_count += 1
            else:
                print(f"   ❌ 插入失败")
                error_count += 1
                
        except Exception as e:
            print(f"   ❌ 处理失败: {e}")
            error_count += 1
    
    print(f"\n🎉 迁移完成!")
    print(f"   ✅ 成功: {success_count} 个")
    print(f"   ❌ 失败: {error_count} 个")
    print(f"   📊 总计: {len(challenges_data)} 个")

def verify_migration():
    """验证迁移结果"""
    print("\n🔍 验证迁移结果...")
    
    try:
        db = get_db_manager()
        challenges = db.get_all_challenges()
        
        print(f"📊 数据库中共有 {len(challenges)} 个挑战")
        
        if challenges:
            print("\n📋 前5个挑战:")
            for i, challenge in enumerate(challenges[:5], 1):
                print(f"   {i}. {challenge['name']} (ID: {challenge['id_alias']}, 难度: {challenge['difficulty_level']})")
        
        # 按平台统计
        platforms = {}
        difficulties = {}
        
        for challenge in challenges:
            platform = challenge['platform']
            difficulty = challenge['difficulty_level']
            
            platforms[platform] = platforms.get(platform, 0) + 1
            difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
        
        print(f"\n📈 平台分布:")
        for platform, count in platforms.items():
            print(f"   {platform}: {count} 个")
        
        print(f"\n📊 难度分布:")
        for difficulty, count in sorted(difficulties.items()):
            print(f"   难度 {difficulty}: {count} 个")
        
        return True
        
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False

def main():
    """主函数"""
    print("🎯 开始 YAML 到数据库迁移过程")
    
    # 1. 初始化数据库
    print("\n1️⃣ 初始化数据库...")
    if not init_database():
        print("❌ 数据库初始化失败，退出")
        return False
    
    # 2. 加载 YAML 文件
    print("\n2️⃣ 加载 YAML 文件...")
    challenges_dir = '../frontend/docs/challenges'
    challenges_data = load_yaml_files(challenges_dir)
    
    if not challenges_data:
        print("❌ 没有找到有效的挑战数据，退出")
        return False
    
    # 3. 迁移数据
    print("\n3️⃣ 迁移数据到数据库...")
    migrate_challenges_to_db(challenges_data)
    
    # 4. 验证迁移
    print("\n4️⃣ 验证迁移结果...")
    verify_migration()
    
    print("\n🎉 迁移过程完成!")
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  用户中断操作")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 迁移过程发生错误: {e}")
        sys.exit(1)
