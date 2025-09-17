import { Article } from "@/app/generated/prisma";
import { useEffect, useState, useCallback } from "react";
import { getArticles } from "@/app/actions/articles/get-articles";

interface UseArticleLoaderProps {
  whereCondition: any;
  initialArticles: Article[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  limit?: number;
}

export function useArticleLoader({
  whereCondition,
  initialArticles,
  initialHasMore,
  initialNextCursor,
  limit = 10,
}: UseArticleLoaderProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setArticles(initialArticles);
    setNextCursor(initialNextCursor);
    setHasMore(initialHasMore);
  }, [initialArticles, initialHasMore, initialNextCursor]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || !nextCursor) return;

    setIsLoading(true);

    try {
      const result = await getArticles(whereCondition, {
        cursor: nextCursor,
        limit: limit,
      });

      if (result && result.articles) {
        setArticles((prev) => [...prev, ...result.articles!]);
        setNextCursor(result.nextCursor || null);
        setHasMore(result.hasMore || false);
      }
    } catch (error) {
      console.error("記事読み込みエラー:", error);
    } finally {
      setIsLoading(false);
    }
  }, [whereCondition, nextCursor, hasMore, isLoading, limit]);

  return {
    articles,
    hasMore,
    isLoading,
    loadMore,
  };
}