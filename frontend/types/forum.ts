/**
 * 论坛系统相关的类型定义
 */

// 挑战评论
export interface ChallengeComment {
  id: number;
  challenge_id: number;
  user_id: number;
  content: string;
  parent_id?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  
  // 关联数据
  user?: {
    id: number;
    username: string;
    avatar_url: string;
    role: string;
  };
  replies?: ChallengeComment[];
}

// 讨论区帖子
export interface ForumPost {
  id: number;
  user_id: number;
  challenge_id?: number;
  title: string;
  content: string; // Markdown格式
  view_count: number;
  like_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  
  // 关联数据
  user?: {
    id: number;
    username: string;
    avatar_url: string;
    role: string;
  };
  challenge?: {
    id: number;
    name: string;
    id_alias: string;
  };
  latest_reply?: ForumReply;
}

// 帖子回复
export interface ForumReply {
  id: number;
  post_id: number;
  user_id: number;
  content: string; // Markdown格式
  parent_id?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  
  // 关联数据
  user?: {
    id: number;
    username: string;
    avatar_url: string;
    role: string;
  };
  replies?: ForumReply[];
}

// 用户存储记录
export interface UserStorage {
  id: number;
  user_id: number;
  file_name: string;
  file_size: number; // 字节
  file_type: string;
  blob_url: string;
  upload_purpose: 'avatar' | 'post_image' | 'attachment' | 'other';
  is_deleted: boolean;
  created_at: string;
}

// 用户钱包
export interface UserWallet {
  id: number;
  user_id: number;
  wallet_address: string;
  private_key_encrypted: string;
  crawler_coin_balance: number; // wei单位
  created_at: string;
  updated_at: string;
}

// 代币交易记录
export interface TokenTransaction {
  id: number;
  from_user_id?: number;
  to_user_id?: number;
  transaction_type: 'tip' | 'purchase_storage' | 'post_cost' | 'reply_cost' | 'initial_grant';
  amount: number; // wei单位
  related_id?: number;
  related_type?: 'post' | 'reply' | 'comment' | 'storage';
  blockchain_tx_hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  description?: string;
  created_at: string;
  updated_at: string;
  
  // 关联数据
  from_user?: {
    id: number;
    username: string;
    avatar_url: string;
  };
  to_user?: {
    id: number;
    username: string;
    avatar_url: string;
  };
}

// 打赏记录
export interface TipRecord {
  id: number;
  from_user_id: number;
  to_user_id: number;
  target_type: 'post' | 'reply' | 'comment';
  target_id: number;
  amount: number; // wei单位
  transaction_id?: number;
  blockchain_tx_hash?: string;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
  
  // 关联数据
  from_user?: {
    id: number;
    username: string;
    avatar_url: string;
  };
  to_user?: {
    id: number;
    username: string;
    avatar_url: string;
  };
  transaction?: TokenTransaction;
}

// 用户存储配额
export interface UserStorageQuota {
  id: number;
  user_id: number;
  total_quota: number; // 字节
  used_quota: number; // 字节
  purchased_quota: number; // 字节
  updated_at: string;
}

// API响应类型
export interface ForumPostsResponse {
  posts: ForumPost[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface CommentsResponse {
  comments: ChallengeComment[];
  total: number;
}

export interface RepliesResponse {
  replies: ForumReply[];
  total: number;
}

// 创建/更新类型
export interface CreateCommentRequest {
  challenge_id: number;
  content: string;
  parent_id?: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  challenge_id?: number;
}

export interface CreateReplyRequest {
  post_id: number;
  content: string;
  parent_id?: number;
}

export interface TipRequest {
  target_type: 'post' | 'reply' | 'comment';
  target_id: number;
  amount: number; // wei单位
  message?: string;
  is_anonymous?: boolean;
}

// 常量定义
export const UPLOAD_PURPOSES = {
  AVATAR: 'avatar',
  POST_IMAGE: 'post_image',
  ATTACHMENT: 'attachment',
  OTHER: 'other',
} as const;

export const TRANSACTION_TYPES = {
  TIP: 'tip',
  PURCHASE_STORAGE: 'purchase_storage',
  POST_COST: 'post_cost',
  REPLY_COST: 'reply_cost',
  INITIAL_GRANT: 'initial_grant',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

// 代币相关常量
export const CRAWLER_COIN = {
  SYMBOL: 'CRAWLER',
  DECIMALS: 18,
  INITIAL_BALANCE: 1000000, // 1,000,000 CRAWLER
  POST_COST: 100, // 发帖消耗100 CRAWLER
  REPLY_COST: 50, // 回复消耗50 CRAWLER
  STORAGE_PRICE_PER_MB: 1000, // 每MB存储空间1000 CRAWLER
} as const;

// 存储相关常量
export const STORAGE_LIMITS = {
  DEFAULT_QUOTA: 100 * 1024 * 1024, // 100MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB单文件限制
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_ATTACHMENT_TYPES: [
    'application/pdf',
    'application/zip',
    'text/plain',
    'application/json',
  ],
} as const;
