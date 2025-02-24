import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { telegram, getTelegramUser } from "@/lib/telegram";
import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

export default function SavedArticles() {
  const { t } = useTranslation();
  const user = getTelegramUser();

  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/saved-articles', user?.id],
    enabled: !!user,
  });

  const handleShare = (article: Article) => {
    if (telegram) {
      telegram.switchInlineQuery(article.title);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-4">
        <BackButton />
        <div className="mt-12">
          <p className="text-center text-white/60">
            Please open this app from Telegram
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <BackButton />
        <div className="mt-12">
          <p className="text-center text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <BackButton />
        <div className="mt-12">
          <p className="text-center text-white/60">
            Failed to load saved articles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <BackButton />

      <div className="mt-12">
        <h2 className="text-xl font-medium mb-6">{t('saved_articles')}</h2>

        <div className="space-y-4">
          {articles?.map(article => (
            <Card key={article.id} className="bg-black/40 overflow-hidden">
              <div className="relative">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleShare(article)}
                    className="p-2.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    title={t('share_to_telegram')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-white">
                  {article.title}
                </h3>
                <p className="text-white/70 mt-2 text-sm">
                  {article.content}
                </p>
              </CardContent>
            </Card>
          ))}

          {articles?.length === 0 && (
            <p className="text-center text-white/60">
              No saved articles yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}