import InfiniteArticleLists from "./components/InfiniteArticleLists";
import MobileLayout from "./components/MobileLayout";
import { getWhereCondition } from "@/lib/getWhereCondition";
import { getArticles } from "./actions/articles/get-articles";
import { getPageTitle } from "@/lib/getPageTitle";
import { getSearchWhereCondition } from "@/lib/getSearchWhereCondition";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

interface HomeProps {
  searchParams: Promise<{
    listtype?: string;
    keyword?: string;
  }>;
}

export default async function Home(props: HomeProps) {
  const params = await props.searchParams;
  const listtype = params.listtype || "default";
  const keyword = params.keyword;

  let pageTitle;
  let whereCondition;

  const userId = await getCurrentUserId();

  if (keyword) {
    pageTitle = `検索結果:${keyword}`;
    whereCondition = getSearchWhereCondition(keyword, userId);
  } else {
    pageTitle = getPageTitle(listtype);
    whereCondition = getWhereCondition(listtype, userId);
  }

  const initialData = await getArticles(whereCondition, {
    limit: 10,
  });

  if (!initialData) {
    return (
      <div className="w-11/12 mx-auto">
        <MobileLayout>
          <p className="text-red-500">記事の取得に失敗しました</p>
        </MobileLayout>
      </div>
    );
  }

  return (
    <MobileLayout>
      <InfiniteArticleLists
        title={pageTitle}
        whereCondition={whereCondition}
        initialArticles={initialData.articles}
        initialNextCursor={initialData.nextCursor || null}
        initialHasMore={initialData.hasMore || false}
      />
    </MobileLayout>
  );
}