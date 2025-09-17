"use server";

import prisma from "@/lib/prisma";
import { Article } from "@/app/generated/prisma";

type GetArticlesProps = {
  userId: string;
  isLiked?: boolean;
  isArchived?: boolean;
};

// 🆕 オプションの型定義
export type PaginationOptions = {
  offset?: number;
  limit?: number;
  includeTotalCount?: boolean;
};

// 🆕 戻り値の型定義
export type GetArticlesResult = {
  articles: Article[];
  totalCount?: number;
};

export async function getArticles(
  whereCondition: GetArticlesProps,
  options: PaginationOptions = {}
): Promise<GetArticlesResult | undefined> {
  try {
    const { offset = 0, limit = 10, includeTotalCount = false } = options;

    const articles = await prisma.article.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset, // 🆕 ページネーション対応
      take: limit, // 🆕 件数制限
    });

    // 🆕 総件数取得（必要な場合のみ）
    let totalCount;
    if (includeTotalCount) {
      totalCount = await prisma.article.count({
        where: whereCondition,
      });
    }

    return { articles, totalCount };
  } catch (err) {
    console.error(err);
  }
}
