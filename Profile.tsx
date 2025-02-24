import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { getTelegramUser } from "@/lib/telegram";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const user = getTelegramUser();

  if (!user) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-center text-white/60">
          Пожалуйста, откройте приложение через Telegram
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="bg-black/40 w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 mb-6">
              {user.photo_url ? (
                <AvatarImage 
                  src={user.photo_url} 
                  alt={user.first_name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-4xl bg-blue-600">
                  {user.first_name[0]}
                </AvatarFallback>
              )}
            </Avatar>

            <h2 className="text-2xl font-medium mb-2">
              {user.first_name} {user.last_name}
            </h2>
            {user.username && (
              <p className="text-white/70 mb-8">@{user.username}</p>
            )}

            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Telegram ID</span>
                <span>{user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">{t('language')}</span>
                <span>{i18n.language.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}