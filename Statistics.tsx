import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getTelegramUser } from "@/lib/telegram";

export default function Statistics() {
  const { t } = useTranslation();
  const user = getTelegramUser();

  const { data: savedArticlesCount } = useQuery({
    queryKey: ['/api/saved-articles/count', user?.id],
    select: (data: { count: number }) => data.count,
    enabled: !!user,
  });

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

  return (
    <div className="min-h-screen p-4">
      <BackButton />

      <div className="mt-12">
        <Card className="bg-black/40">
          <CardContent className="p-4">
            <h2 className="text-xl font-medium mb-4">{t('statistics')}</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">{t('articles_saved')}</span>
                <span className="text-xl font-medium">
                  {savedArticlesCount ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}