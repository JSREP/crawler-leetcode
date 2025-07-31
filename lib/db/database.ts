/**
 * 数据库连接和操作模块
 * 使用 Neon Serverless PostgreSQL
 */
import { neon } from '@neondatabase/serverless';
import { Challenge, DatabaseChallenge, ChallengeStats, transformDatabaseChallenge } from '@/types/challenge';

// 创建数据库连接
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('数据库连接测试成功:', result[0]);
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

/**
 * 获取所有挑战
 */
export async function getAllChallenges(): Promise<Challenge[]> {
  try {
    const result = await sql`
      SELECT
        id, id_alias, name, name_en, platform, difficulty_level,
        description_markdown, description_markdown_en, base64_url,
        is_expired, tags, created_at, updated_at
      FROM challenges
      ORDER BY created_at DESC
    `;

    return result.map((row: unknown) => transformDatabaseChallenge(row as DatabaseChallenge));
  } catch (error) {
    throw new DatabaseError('获取挑战列表失败', error as Error);
  }
}

/**
 * 分页获取挑战
 */
export async function getChallengesPaginated(
  page: number = 1,
  perPage: number = 20,
  filters?: {
    platform?: string;
    difficulty?: number;
    tag?: string;
    query?: string;
  }
): Promise<{ challenges: Challenge[]; total: number; pages: number }> {
  try {
    const offset = (page - 1) * perPage;
    
    // 构建查询条件
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;
    
    if (filters?.platform && filters.platform !== 'all') {
      conditions.push(`platform = $${paramIndex++}`);
      params.push(filters.platform);
    }
    
    if (filters?.difficulty) {
      conditions.push(`difficulty_level = $${paramIndex++}`);
      params.push(filters.difficulty);
    }
    
    if (filters?.tag) {
      conditions.push(`tags @> $${paramIndex++}`);
      params.push(JSON.stringify([filters.tag]));
    }
    
    if (filters?.query) {
      conditions.push(`(name ILIKE $${paramIndex++} OR description_markdown ILIKE $${paramIndex++})`);
      params.push(`%${filters.query}%`, `%${filters.query}%`);
      paramIndex++; // 因为添加了两个参数
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // 如果没有筛选条件，使用简单查询
    if (conditions.length === 0) {
      // 获取总数
      const countResult = await sql`SELECT COUNT(*) as total FROM challenges`;
      const total = parseInt(countResult[0].total);

      // 获取分页数据
      const dataResult = await sql`
        SELECT
          id, id_alias, name, name_en, platform, difficulty_level,
          description_markdown, description_markdown_en, base64_url,
          is_expired, tags, created_at, updated_at
        FROM challenges
        ORDER BY created_at DESC
        LIMIT ${perPage} OFFSET ${offset}
      `;

      const challenges = dataResult.map((row: unknown) =>
        transformDatabaseChallenge(row as DatabaseChallenge)
      );

      return {
        challenges,
        total,
        pages: Math.ceil(total / perPage)
      };
    }

    // 有筛选条件时，需要动态构建查询
    // 这里暂时返回空结果，需要进一步实现复杂查询
    return {
      challenges: [],
      total: 0,
      pages: 0
    };
    
    return {
      challenges,
      total,
      pages: Math.ceil(total / perPage)
    };
  } catch (error) {
    throw new DatabaseError('获取分页挑战数据失败', error as Error);
  }
}

/**
 * 根据别名获取单个挑战
 */
export async function getChallengeByAlias(alias: string): Promise<Challenge | null> {
  try {
    const result = await sql`
      SELECT
        id, id_alias, name, name_en, platform, difficulty_level,
        description_markdown, description_markdown_en, base64_url,
        is_expired, tags, created_at, updated_at
      FROM challenges
      WHERE id_alias = ${alias}
    `;

    if (result.length === 0) {
      return null;
    }

    return transformDatabaseChallenge(result[0] as DatabaseChallenge);
  } catch (error) {
    throw new DatabaseError(`获取挑战 ${alias} 失败`, error as Error);
  }
}

/**
 * 根据ID获取单个挑战
 */
export async function getChallengeById(id: number): Promise<Challenge | null> {
  try {
    const result = await sql`
      SELECT
        id, id_alias, name, name_en, platform, difficulty_level,
        description_markdown, description_markdown_en, base64_url,
        is_expired, tags, created_at, updated_at
      FROM challenges
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return null;
    }

    return transformDatabaseChallenge(result[0] as DatabaseChallenge);
  } catch (error) {
    throw new DatabaseError(`获取挑战 ID ${id} 失败`, error as Error);
  }
}

/**
 * 获取挑战统计信息
 */
export async function getChallengeStats(): Promise<ChallengeStats> {
  try {
    // 总数统计
    const totalResult = await sql`SELECT COUNT(*) as total FROM challenges`;
    const total = parseInt(totalResult[0].total);

    // 平台分布
    const platformResult = await sql`
      SELECT platform, COUNT(*) as count
      FROM challenges
      GROUP BY platform
      ORDER BY count DESC
    `;

    // 难度分布
    const difficultyResult = await sql`
      SELECT difficulty_level, COUNT(*) as count
      FROM challenges
      GROUP BY difficulty_level
      ORDER BY difficulty_level
    `;

    // 标签统计（前10个最常用的标签）
    const tagResult = await sql`
      SELECT tag, COUNT(*) as count
      FROM (
        SELECT jsonb_array_elements_text(tags) as tag
        FROM challenges
        WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0
      ) as tag_list
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `;
    
    return {
      total,
      platforms: platformResult.map(row => ({
        platform: row.platform,
        count: parseInt(row.count)
      })),
      difficulties: difficultyResult.map(row => ({
        difficulty_level: parseInt(row.difficulty_level),
        count: parseInt(row.count)
      })),
      tags: tagResult.map(row => ({
        tag: row.tag,
        count: parseInt(row.count)
      }))
    };
  } catch (error) {
    throw new DatabaseError('获取挑战统计信息失败', error as Error);
  }
}

/**
 * 创建新挑战
 */
export async function createChallenge(challengeData: Omit<DatabaseChallenge, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  try {
    const result = await sql`
      INSERT INTO challenges (
        id_alias, name, name_en, platform, difficulty_level,
        description_markdown, description_markdown_en, base64_url,
        is_expired, tags
      ) VALUES (
        ${challengeData.id_alias},
        ${challengeData.name},
        ${challengeData.name_en || null},
        ${challengeData.platform},
        ${challengeData.difficulty_level},
        ${challengeData.description_markdown || null},
        ${challengeData.description_markdown_en || null},
        ${challengeData.base64_url},
        ${challengeData.is_expired},
        ${JSON.stringify(challengeData.tags)}
      )
      RETURNING id
    `;
    
    return result[0].id;
  } catch (error) {
    throw new DatabaseError('创建挑战失败', error as Error);
  }
}

/**
 * 更新挑战
 */
export async function updateChallenge(id: number, challengeData: Partial<DatabaseChallenge>): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE challenges 
      SET 
        name = COALESCE(${challengeData.name}, name),
        name_en = COALESCE(${challengeData.name_en}, name_en),
        platform = COALESCE(${challengeData.platform}, platform),
        difficulty_level = COALESCE(${challengeData.difficulty_level}, difficulty_level),
        description_markdown = COALESCE(${challengeData.description_markdown}, description_markdown),
        description_markdown_en = COALESCE(${challengeData.description_markdown_en}, description_markdown_en),
        base64_url = COALESCE(${challengeData.base64_url}, base64_url),
        is_expired = COALESCE(${challengeData.is_expired}, is_expired),
        tags = COALESCE(${challengeData.tags ? JSON.stringify(challengeData.tags) : null}, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    
    return result.length > 0;
  } catch (error) {
    throw new DatabaseError(`更新挑战 ID ${id} 失败`, error as Error);
  }
}
