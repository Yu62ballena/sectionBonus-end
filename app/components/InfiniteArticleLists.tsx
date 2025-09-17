"use client";

import ArticleCard from "./ArticleCard";
import { Article } from "@/app/generated/prisma";
import LoadingIndicator from "./LoadingIndicator";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useArticleLoader } from "@/hooks/useArticleLoader";

type InfiniteArticleListsProps = {
  title: string;
  whereCondition: any;
  initialArticles: Article[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

function InfiniteArticleLists({
  title,
  whereCondition,
  initialArticles,
  initialNextCursor,
  initialHasMore,
}: InfiniteArticleListsProps) {

  const { articles, hasMore, isLoading, loadMore } = useArticleLoader({
    whereCondition,
    initialArticles,
    initialNextCursor,
    initialHasMore,
  });

  useInfiniteScroll({
    loadMore,
    hasMore,
    isLoading,
  });

  return (
    <div className="w-full lg:w-4/5 px-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">{title}</h2>
      </div>
      <hr />

      <div className="p-4 flex flex-col gap-4">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            articleData={article}
          />
        ))}
      </div>

      <LoadingIndicator
        isLoading={isLoading}
        hasMore={hasMore}
        articlesLength={articles.length}
        loadMore={loadMore}
      />
    </div>
  );
}

export default InfiniteArticleLists;