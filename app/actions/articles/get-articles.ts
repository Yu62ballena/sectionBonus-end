"use server";

import prisma from "@/lib/prisma";
import { Article } from "@/app/generated/prisma";

type GetArticlesProps = {
  userId: string;
  isLiked?: boolean;
  isArchived?: boolean;
};

export type PaginationOptions = {
  offset?: number;
  limit?: number;
  cursor?: string;
  includeTotalCount?: boolean;
};

export type GetArticlesResult = {
  articles: Article[];
  totalCount?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
};

export async function getArticles(
  whereCondition: GetArticlesProps,
  options: PaginationOptions = {}
): Promise<GetArticlesResult | undefined> {
  try {
    const { offset = 0, limit = 10, cursor, includeTotalCount = false } = options;

    if (cursor) {
      // カーソルベースページネーション（無限スクロール用）
      const articles = await prisma.article.findMany({
        where: {
          ...whereCondition,
          id: {
            lt: cursor,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
      });

      const hasMore = articles.length > limit;
      const displayArticles = hasMore ? articles.slice(0, -1) : articles;
      const nextCursor = hasMore
        ? displayArticles[displayArticles.length - 1]?.id
        : null;

      return {
        articles: displayArticles,
        hasMore,
        nextCursor,
      };
    } else {
      // 初回読み込み時（カーソル無し）
      const articles = await prisma.article.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit + 1, // +1で次のページがあるかチェック
      });

      const hasMore = articles.length > limit;
      const displayArticles = hasMore ? articles.slice(0, -1) : articles;
      const nextCursor = hasMore
        ? displayArticles[displayArticles.length - 1]?.id
        : null;

      let totalCount;
      if (includeTotalCount) {
        totalCount = await prisma.article.count({
          where: whereCondition,
        });
      }

      return { 
        articles: displayArticles, 
        totalCount,
        hasMore,
        nextCursor
      };
    }
  } catch (err) {
    console.error(err);
  }
}