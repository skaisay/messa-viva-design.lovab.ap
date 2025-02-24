import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, BookmarkPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { telegram, getTelegramUser } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArticleCategories } from "@shared/schema";

interface Article {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function Articles() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = getTelegramUser();
  const [_, setLocation] = useLocation();

  const categories = [
    { id: ArticleCategories.PERSONAL, label: 'personal' },
    { id: ArticleCategories.NEWS, label: 'news' },
    { id: ArticleCategories.TECH, label: 'tech' },
    { id: ArticleCategories.PUBLIC, label: 'public' }
  ] as const;

  const { data: articles = {}, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();

      return data.reduce((acc: Record<string, Article[]>, article: Article) => {
        if (!acc[article.category]) {
          acc[article.category] = [];
        }
        acc[article.category].push(article);
        return acc;
      }, {});
    }
  });

  const handleShare = (article: Article) => {
    if (telegram) {
      telegram.switchInlineQuery(article.title);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (article: Article) => {
      if (!user) throw new Error("User not found");

      const response = await fetch('/api/saved-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          article_id: article.id
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save article: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-articles'] });
      toast({
        title: t('article_saved'),
        description: t('article_saved_description'),
      });
    },
    onError: (error: Error) => {
      console.error('Save error:', error);
      toast({
        title: t('error'),
        description: t('save_error'),
        variant: "destructive",
      });
    }
  });

  const handleSave = (article: Article) => {
    saveMutation.mutate(article);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="mt-12 text-center">
          <p className="text-white/60">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-4 pb-20 prevent-scroll-chaining smooth-scroll"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mt-4">
        <Tabs defaultValue="personal" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-black/40 mt-16">
              {categories.map(category => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-white/10"
                >
                  {t(category.label)}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button
              variant="ghost"
              size="icon"
              className="mt-16"
              onClick={() => setLocation('/new-article')}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <motion.div
                className="space-y-4"
                variants={container}
                initial="hidden"
                animate="show"
                layout
              >
                {articles[category.id]?.map((article: Article) => (
                  <motion.div
                    key={article.id}
                    variants={item}
                    layout
                    className="smooth-scroll"
                  >
                    <Card className="bg-black/40 overflow-hidden">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <motion.button
                            onClick={() => handleShare(article)}
                            className="p-2.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            title={t('share_to_telegram')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleSave(article)}
                            className="p-2.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            title={t('save')}
                            disabled={saveMutation.isPending}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                      <CardContent className="p-4">
                        <motion.h3
                          className="text-lg font-medium text-white"
                          layout
                        >
                          {article.title}
                        </motion.h3>
                        <motion.p
                          className="text-white/70 mt-2 text-sm"
                          layout
                        >
                          {article.description}
                        </motion.p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
}