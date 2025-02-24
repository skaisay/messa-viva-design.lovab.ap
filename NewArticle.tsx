import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getTelegramUser } from "@/lib/telegram";

enum Step {
  UPLOAD,
  DETAILS,
  REVIEW
}

export default function NewArticle() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = getTelegramUser();

  const [currentStep, setCurrentStep] = useState<Step>(Step.UPLOAD);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('error'),
        description: t('image_too_large'),
        variant: "destructive",
      });
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: t('error'),
        description: t('invalid_image_type'),
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('login_required'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', 'personal');
      formData.append('user_id', user.id.toString()); // Convert to string
      formData.append('image', selectedImage as File);

      console.log('Sending article data:', {
        title,
        content,
        category: 'personal',
        user_id: user.id.toString() // Log as string
      });

      const response = await fetch('/api/articles', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('failed_to_create_article'));
      }

      const result = await response.json();
      console.log('Article created:', result);

      await queryClient.invalidateQueries({ queryKey: ['articles'] });

      toast({
        title: t('success'),
        description: t('article_created_successfully'),
      });

      setLocation('/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: t('error'),
        description: t('failed_to_create_article'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen p-4 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <BackButton />

      <AnimatePresence mode="wait">
        {currentStep === Step.UPLOAD && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card className="p-6 bg-black/40">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t('select_photo')}</h2>

                <div className="relative h-[300px] border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white/60">{t('drop_photo_here')}</p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedImage}
                  onClick={() => setCurrentStep(Step.DETAILS)}
                >
                  {t('continue')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === Step.DETAILS && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card className="p-6 bg-black/40">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t('article_details')}</h2>

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-[200px] object-cover rounded-lg"
                  />
                )}

                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder={t('enter_title')}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Textarea
                      placeholder={t('enter_content')}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Step.UPLOAD)}
                  >
                    {t('back')}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!title || !content}
                    onClick={() => setCurrentStep(Step.REVIEW)}
                  >
                    {t('continue')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {currentStep === Step.REVIEW && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <Card className="p-6 bg-black/40">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t('review_and_publish')}</h2>

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-[200px] object-cover rounded-lg"
                  />
                )}

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="text-white/70">{content}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Step.DETAILS)}
                  >
                    {t('back')}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('publishing') : t('publish')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}