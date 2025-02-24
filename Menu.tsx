import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bitcoin, 
  Star, 
  BarChart, 
  Settings as SettingsIcon,
  Wallet,
  Heart,
  Bookmark
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getTelegramUser } from "@/lib/telegram";
import { motion } from "framer-motion";

export default function Menu() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const user = getTelegramUser();

  const { data: savedArticlesCount } = useQuery({
    queryKey: ['/api/saved-articles/count', user?.id],
    select: (data: { count: number }) => data.count,
    enabled: !!user
  });

  // Анимированная метка "НОВОЕ"
  const NewFeatureBadge = () => (
    <motion.span
      className="inline-block px-2 py-0.5 ml-2 text-xs font-medium bg-green-500/20 text-green-400 rounded-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      {t('new_feature')}
    </motion.span>
  );

  const menuItems = [
    { 
      icon: Bitcoin, 
      label: 'cryptocurrency', 
      action: () => setLocation('/crypto'),
      isNew: true
    },
    { 
      icon: Bookmark, 
      label: 'saved_articles', 
      action: () => setLocation('/saved-articles'),
      count: savedArticlesCount
    },
    { 
      icon: BarChart, 
      label: 'statistics', 
      action: () => setLocation('/statistics')
    },
    { 
      icon: Wallet,
      label: 'telegram_wallet',
      action: () => setLocation('/wallet'),
      isNew: true
    },
    { 
      icon: Heart,
      label: 'donate',
      action: () => setLocation('/donate'),
      isNew: true
    },
    { 
      icon: SettingsIcon, 
      label: 'settings', 
      action: () => setLocation('/settings'),
      isNew: true
    },
  ];

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

      <div className="space-y-4 mt-4">
        {menuItems.map((item, index) => (
          <Card key={index} className="bg-black/40">
            <CardContent className="p-4">
              <button 
                onClick={item.action}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <div className="flex items-center">
                    <span>{t(item.label)}</span>
                    {item.isNew && <NewFeatureBadge />}
                  </div>
                </div>
                {item.count !== undefined && (
                  <span className="text-sm text-white/60">{item.count}</span>
                )}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}