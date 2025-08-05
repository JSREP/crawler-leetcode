/**
 * Web3钱包系统相关的类型定义
 */

// 用户钱包
export interface UserWallet {
  id: number;
  user_id: number;
  wallet_address: string;
  private_key_encrypted: string;
  crawler_coin_balance: string; // 使用字符串存储大数值
  created_at: string;
  updated_at: string;
}

// 钱包创建请求
export interface CreateWalletRequest {
  user_id: number;
  password?: string; // 可选的额外密码保护
}

// 钱包信息响应
export interface WalletInfo {
  wallet_address: string;
  crawler_coin_balance: string;
  balance_formatted: string; // 格式化后的余额显示
  created_at: string;
}

// 代币交易类型
export enum TransactionType {
  TIP = 'tip',
  PURCHASE_STORAGE = 'purchase_storage',
  POST_COST = 'post_cost',
  REPLY_COST = 'reply_cost',
  INITIAL_GRANT = 'initial_grant',
  TRANSFER = 'transfer',
}

// 代币交易记录
export interface TokenTransaction {
  id: number;
  from_user_id?: number;
  to_user_id?: number;
  transaction_type: TransactionType;
  amount: string; // 使用字符串存储大数值
  related_id?: number;
  related_type?: string;
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

// 创建交易请求
export interface CreateTransactionRequest {
  from_user_id?: number;
  to_user_id?: number;
  transaction_type: TransactionType;
  amount: string;
  related_id?: number;
  related_type?: string;
  description?: string;
}

// 打赏记录
export interface TipRecord {
  id: number;
  from_user_id: number;
  to_user_id: number;
  target_type: 'post' | 'reply' | 'comment';
  target_id: number;
  amount: string;
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

// 创建打赏请求
export interface CreateTipRequest {
  to_user_id: number;
  target_type: 'post' | 'reply' | 'comment';
  target_id: number;
  amount: string;
  message?: string;
  is_anonymous?: boolean;
}

// 钱包操作响应
export interface WalletOperationResponse {
  success: boolean;
  message: string;
  data?: any;
  transaction_id?: number;
  blockchain_tx_hash?: string;
}

// 代币余额信息
export interface TokenBalance {
  balance: string; // wei单位
  balance_formatted: string; // 格式化显示
  balance_ether: string; // ether单位
}

// 钱包统计信息
export interface WalletStats {
  total_earned: string;
  total_spent: string;
  total_tips_received: string;
  total_tips_sent: string;
  transaction_count: number;
}

// 钱包配置
export interface WalletConfig {
  initial_balance: string; // 初始余额（wei）
  post_cost: string; // 发帖费用（wei）
  reply_cost: string; // 回复费用（wei）
  storage_price_per_mb: string; // 每MB存储价格（wei）
  min_tip_amount: string; // 最小打赏金额（wei）
  max_tip_amount: string; // 最大打赏金额（wei）
}

// 常量定义
export const WALLET_CONSTANTS = {
  INITIAL_BALANCE: '100000000000000000000', // 100 CRAWLER Coin (wei) - 调整为PostgreSQL bigint安全范围
  POST_COST: '1000000000000000000', // 1 CRAWLER Coin (wei)
  REPLY_COST: '500000000000000000', // 0.5 CRAWLER Coin (wei)
  STORAGE_PRICE_PER_MB: '10000000000000000000', // 10 CRAWLER Coin per MB (wei)
  MIN_TIP_AMOUNT: '100000000000000000', // 0.1 CRAWLER Coin (wei)
  MAX_TIP_AMOUNT: '100000000000000000000', // 100 CRAWLER Coin (wei) - 调整为安全范围
  DECIMALS: 18,
  SYMBOL: 'CRAWLER',
  NAME: 'CRAWLER Coin',
} as const;

// 工具函数类型
export interface WalletUtils {
  formatBalance: (balance: string) => string;
  parseBalance: (balance: string) => string;
  validateAmount: (amount: string) => boolean;
  generateWallet: () => Promise<{ address: string; privateKey: string }>;
  encryptPrivateKey: (privateKey: string, password: string) => string;
  decryptPrivateKey: (encryptedKey: string, password: string) => string;
}
