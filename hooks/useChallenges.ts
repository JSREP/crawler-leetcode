/**
 * 挑战数据管理Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { Challenge, ChallengeFilters } from '@/types/challenge';
import { API_ROUTES } from '@/constants';

interface UseChallengesReturn {
  challenges: Challenge[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  filters: ChallengeFilters;
  fetchChallenges: (page?: number, newFilters?: ChallengeFilters) => Promise<void>;
  setFilters: (filters: ChallengeFilters) => void;
  setPageSize: (size: number) => void;
  refreshData: () => Promise<void>;
}

export function useChallenges(initialPageSize: number = 10): UseChallengesReturn {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState<ChallengeFilters>({
    search: '',
    difficulty: '',
    tags: [],
  });

  const fetchChallenges = useCallback(async (
    page: number = 1,
    newFilters: ChallengeFilters = filters
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pageSize.toString(),
      });

      if (newFilters.search) {
        params.append('search', newFilters.search);
      }
      if (newFilters.difficulty) {
        params.append('difficulty', newFilters.difficulty);
      }
      if (newFilters.tags && newFilters.tags.length > 0) {
        params.append('tags', newFilters.tags.join(','));
      }

      const response = await fetch(`${API_ROUTES.CHALLENGES}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setChallenges(data.challenges || []);
      setTotal(data.total || 0);
      setCurrentPage(page);
      setFilters(newFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取数据失败';
      setError(errorMessage);
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize, filters]);

  const refreshData = useCallback(() => {
    return fetchChallenges(currentPage, filters);
  }, [fetchChallenges, currentPage, filters]);

  useEffect(() => {
    fetchChallenges(1);
  }, [fetchChallenges]);

  return {
    challenges,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    filters,
    fetchChallenges,
    setFilters,
    setPageSize,
    refreshData,
  };
}
