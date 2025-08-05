/**
 * Web3钱包工具函数
 */

import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { WALLET_CONSTANTS } from '@/types/wallet';

/**
 * 生成新的以太坊钱包
 */
export async function generateWallet(): Promise<{ address: string; privateKey: string }> {
  try {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw new Error('Failed to generate wallet');
  }
}

/**
 * 加密私钥
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(privateKey, password).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encrypting private key:', error);
    throw new Error('Failed to encrypt private key');
  }
}

/**
 * 解密私钥
 */
export function decryptPrivateKey(encryptedKey: string, password: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Invalid password or corrupted data');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting private key:', error);
    throw new Error('Failed to decrypt private key');
  }
}

/**
 * 格式化代币余额显示
 */
export function formatBalance(balance: string): string {
  try {
    const balanceInEther = ethers.formatEther(balance);
    const num = parseFloat(balanceInEther);
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    } else if (num >= 1) {
      return num.toFixed(2);
    } else {
      return num.toFixed(4);
    }
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
}

/**
 * 解析用户输入的金额为wei
 */
export function parseBalance(balance: string): string {
  try {
    // 移除空格和特殊字符
    const cleanBalance = balance.trim().replace(/[^\d.]/g, '');
    
    if (!cleanBalance || isNaN(parseFloat(cleanBalance))) {
      throw new Error('Invalid balance format');
    }
    
    return ethers.parseEther(cleanBalance).toString();
  } catch (error) {
    console.error('Error parsing balance:', error);
    throw new Error('Invalid balance format');
  }
}

/**
 * 验证金额是否有效
 */
export function validateAmount(amount: string): boolean {
  try {
    const amountBigInt = BigInt(amount);
    const minAmount = BigInt(WALLET_CONSTANTS.MIN_TIP_AMOUNT);
    const maxAmount = BigInt(WALLET_CONSTANTS.MAX_TIP_AMOUNT);
    
    return amountBigInt >= minAmount && amountBigInt <= maxAmount;
  } catch (error) {
    console.error('Error validating amount:', error);
    return false;
  }
}

/**
 * 检查余额是否足够
 */
export function hasEnoughBalance(balance: string, amount: string): boolean {
  try {
    const balanceBigInt = BigInt(balance);
    const amountBigInt = BigInt(amount);
    
    return balanceBigInt >= amountBigInt;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
}

/**
 * 计算交易费用
 */
export function calculateTransactionCost(type: 'post' | 'reply'): string {
  switch (type) {
    case 'post':
      return WALLET_CONSTANTS.POST_COST;
    case 'reply':
      return WALLET_CONSTANTS.REPLY_COST;
    default:
      return '0';
  }
}

/**
 * 计算存储费用
 */
export function calculateStorageCost(sizeInMB: number): string {
  try {
    const pricePerMB = BigInt(WALLET_CONSTANTS.STORAGE_PRICE_PER_MB);
    const totalCost = pricePerMB * BigInt(Math.ceil(sizeInMB));
    
    return totalCost.toString();
  } catch (error) {
    console.error('Error calculating storage cost:', error);
    return '0';
  }
}

/**
 * 生成钱包密码（基于用户ID和系统密钥）
 */
export function generateWalletPassword(userId: number): string {
  const systemSecret = process.env.NEXTAUTH_SECRET || 'default-secret';
  const combined = `${userId}-${systemSecret}-wallet`;
  
  return CryptoJS.SHA256(combined).toString();
}

/**
 * 验证以太坊地址格式
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * 格式化交易哈希显示
 */
export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 10) {
    return hash;
  }
  
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/**
 * 格式化钱包地址显示
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) {
    return address;
  }
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 转换wei到ether
 */
export function weiToEther(wei: string): string {
  try {
    return ethers.formatEther(wei);
  } catch (error) {
    console.error('Error converting wei to ether:', error);
    return '0';
  }
}

/**
 * 转换ether到wei
 */
export function etherToWei(ether: string): string {
  try {
    return ethers.parseEther(ether).toString();
  } catch (error) {
    console.error('Error converting ether to wei:', error);
    return '0';
  }
}

/**
 * 生成交易描述
 */
export function generateTransactionDescription(
  type: string,
  amount: string,
  relatedType?: string,
  relatedId?: number
): string {
  const formattedAmount = formatBalance(amount);
  
  switch (type) {
    case 'initial_grant':
      return `初始赠送 ${formattedAmount} CRAWLER Coin`;
    case 'post_cost':
      return `发帖消耗 ${formattedAmount} CRAWLER Coin`;
    case 'reply_cost':
      return `回复消耗 ${formattedAmount} CRAWLER Coin`;
    case 'tip':
      return `打赏 ${formattedAmount} CRAWLER Coin`;
    case 'purchase_storage':
      return `购买存储空间 ${formattedAmount} CRAWLER Coin`;
    case 'transfer':
      return `转账 ${formattedAmount} CRAWLER Coin`;
    default:
      return `交易 ${formattedAmount} CRAWLER Coin`;
  }
}

/**
 * 验证交易参数
 */
export function validateTransactionParams(params: {
  amount: string;
  fromUserId?: number;
  toUserId?: number;
  type: string;
}): { valid: boolean; error?: string } {
  const { amount, fromUserId, toUserId, type } = params;
  
  // 验证金额
  if (!amount || amount === '0') {
    return { valid: false, error: '金额不能为空或零' };
  }
  
  try {
    const amountBigInt = BigInt(amount);
    if (amountBigInt <= 0) {
      return { valid: false, error: '金额必须大于零' };
    }
  } catch (error) {
    return { valid: false, error: '金额格式无效' };
  }
  
  // 验证用户ID
  if (type === 'tip' || type === 'transfer') {
    if (!fromUserId || !toUserId) {
      return { valid: false, error: '转账和打赏需要指定发送方和接收方' };
    }
    
    if (fromUserId === toUserId) {
      return { valid: false, error: '不能向自己转账或打赏' };
    }
  }
  
  return { valid: true };
}
