-- MySQL数据库初始化脚本
-- 从PostgreSQL迁移到MySQL的表结构

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS crawler_leetcode 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE crawler_leetcode;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    github_id INT UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    company VARCHAR(255),
    blog VARCHAR(255),
    public_repos INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    
    INDEX idx_users_github_id (github_id),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin'))
);

-- 2. 用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_sessions_token (session_token),
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 挑战表
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_alias VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    platform VARCHAR(100) NOT NULL,
    difficulty_level INT NOT NULL,
    description_markdown TEXT,
    description_markdown_en TEXT,
    base64_url TEXT NOT NULL,
    is_expired BOOLEAN DEFAULT FALSE,
    tags JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_challenges_alias (id_alias),
    INDEX idx_challenges_platform (platform),
    INDEX idx_challenges_difficulty (difficulty_level),
    INDEX idx_challenges_expired (is_expired),
    INDEX idx_challenges_created_at (created_at)
);

-- 4. 挑战评论表
CREATE TABLE IF NOT EXISTS challenge_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_challenge_comments_challenge_id (challenge_id),
    INDEX idx_challenge_comments_user_id (user_id),
    INDEX idx_challenge_comments_parent_id (parent_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES challenge_comments(id) ON DELETE CASCADE
);

-- 5. 论坛帖子表
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_forum_posts_user_id (user_id),
    INDEX idx_forum_posts_challenge_id (challenge_id),
    INDEX idx_forum_posts_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL
);

-- 6. 论坛回复表
CREATE TABLE IF NOT EXISTS forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_forum_replies_post_id (post_id),
    INDEX idx_forum_replies_user_id (user_id),
    INDEX idx_forum_replies_parent_id (parent_id),
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

-- 7. 用户存储记录表
CREATE TABLE IF NOT EXISTS user_storage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    upload_purpose VARCHAR(50) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_storage_user_id (user_id),
    INDEX idx_user_storage_purpose (upload_purpose),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_file (user_id, file_path(255))
);

-- 8. 用户存储配额表
CREATE TABLE IF NOT EXISTS user_storage_quota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    total_quota BIGINT DEFAULT 104857600,
    used_quota BIGINT DEFAULT 0,
    purchased_quota BIGINT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    private_key_encrypted TEXT NOT NULL,
    crawler_coin_balance BIGINT DEFAULT 1000000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. 代币交易记录表
CREATE TABLE IF NOT EXISTS token_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT,
    to_user_id INT,
    transaction_type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    related_id INT,
    related_type VARCHAR(50),
    blockchain_tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_token_transactions_from_user (from_user_id),
    INDEX idx_token_transactions_to_user (to_user_id),
    INDEX idx_token_transactions_type (transaction_type),
    INDEX idx_token_transactions_status (status),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. 打赏记录表
CREATE TABLE IF NOT EXISTS tip_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id INT NOT NULL,
    amount BIGINT NOT NULL,
    transaction_id INT,
    blockchain_tx_hash VARCHAR(66),
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tip_records_from_user (from_user_id),
    INDEX idx_tip_records_to_user (to_user_id),
    INDEX idx_tip_records_target (target_type, target_id),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES token_transactions(id)
);
