-- 论坛系统数据库迁移脚本
-- 包含评论系统、讨论区、文件存储、Web3钱包和代币系统

-- 1. 挑战评论表
CREATE TABLE IF NOT EXISTS challenge_comments (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES challenge_comments(id) ON DELETE CASCADE, -- 支持回复
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 讨论区帖子表
CREATE TABLE IF NOT EXISTS forum_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL, -- 可选关联挑战
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Markdown格式
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE, -- 置顶
    is_locked BOOLEAN DEFAULT FALSE, -- 锁定
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 帖子回复表
CREATE TABLE IF NOT EXISTS forum_replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Markdown格式
    parent_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE, -- 支持嵌套回复
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 用户存储记录表
CREATE TABLE IF NOT EXISTS user_storage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL, -- 文件大小（字节）
    file_type VARCHAR(100) NOT NULL, -- 文件类型
    blob_url TEXT NOT NULL, -- Vercel Blob URL
    upload_purpose VARCHAR(50) NOT NULL, -- 上传用途：avatar, post_image, attachment等
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, blob_url)
);

-- 5. 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL UNIQUE, -- 以太坊地址
    private_key_encrypted TEXT NOT NULL, -- 加密的私钥
    crawler_coin_balance BIGINT DEFAULT 1000000, -- CRAWLER Coin余额（wei单位）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 6. 代币交易记录表
CREATE TABLE IF NOT EXISTS token_transactions (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- tip, purchase_storage, post_cost, reply_cost, initial_grant
    amount BIGINT NOT NULL, -- 交易金额（wei单位）
    related_id INTEGER, -- 关联ID（帖子ID、评论ID等）
    related_type VARCHAR(50), -- 关联类型：post, reply, comment, storage
    blockchain_tx_hash VARCHAR(66), -- 区块链交易哈希
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 打赏记录表
CREATE TABLE IF NOT EXISTS tip_records (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- post, reply, comment
    target_id INTEGER NOT NULL, -- 目标ID
    amount BIGINT NOT NULL, -- 打赏金额（wei单位）
    transaction_id INTEGER REFERENCES token_transactions(id),
    blockchain_tx_hash VARCHAR(66), -- 区块链交易哈希
    message TEXT, -- 打赏留言
    is_anonymous BOOLEAN DEFAULT FALSE, -- 是否匿名打赏
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 用户存储配额表
CREATE TABLE IF NOT EXISTS user_storage_quota (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_quota BIGINT DEFAULT 104857600, -- 总配额（100MB）
    used_quota BIGINT DEFAULT 0, -- 已使用配额
    purchased_quota BIGINT DEFAULT 0, -- 购买的额外配额
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_challenge_comments_challenge_id ON challenge_comments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_comments_user_id ON challenge_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_comments_parent_id ON challenge_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_challenge_id ON forum_posts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent_id ON forum_replies(parent_id);

CREATE INDEX IF NOT EXISTS idx_user_storage_user_id ON user_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_storage_created_at ON user_storage(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_wallets_wallet_address ON user_wallets(wallet_address);

CREATE INDEX IF NOT EXISTS idx_token_transactions_from_user ON token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to_user ON token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tip_records_from_user ON tip_records(from_user_id);
CREATE INDEX IF NOT EXISTS idx_tip_records_to_user ON tip_records(to_user_id);
CREATE INDEX IF NOT EXISTS idx_tip_records_target ON tip_records(target_type, target_id);

-- 创建触发器更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_challenge_comments_updated_at BEFORE UPDATE ON challenge_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_transactions_updated_at BEFORE UPDATE ON token_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_storage_quota_updated_at BEFORE UPDATE ON user_storage_quota FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
