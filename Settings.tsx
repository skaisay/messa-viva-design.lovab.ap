import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useStarfield } from "@/contexts/StarfieldContext";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings, resetSettings } = useStarfield();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'no', label: 'Norsk' },
    { code: 'cn', label: '中文' }
  ];

  // Анимация для метки "НОВОЕ"
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

  return (
    <div className="min-h-screen p-4">
      <BackButton />

      <div className="mt-8 space-y-4">
        <Card className="bg-black/40">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-medium">{t('settings')}</h2>

              <div className="space-y-2">
                <label className="text-sm text-white/70 block">
                  {t('language')}
                </label>
                <Select
                  value={i18n.language}
                  onValueChange={(value) => i18n.changeLanguage(value)}
                >
                  <SelectTrigger className="w-full bg-black/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">
                    {t('starfield_settings')}
                    <NewFeatureBadge />
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t('star_speed')}</Label>
                      <span className="text-sm text-white/60">{settings.speed}x</span>
                    </div>
                    <Slider
                      value={[settings.speed]}
                      onValueChange={([value]) => updateSettings({ speed: value })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>{t('star_density')}</Label>
                      <span className="text-sm text-white/60">{settings.density}x</span>
                    </div>
                    <Slider
                      value={[settings.density]}
                      onValueChange={([value]) => updateSettings({ density: value })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('hide_stars')}</Label>
                    <Switch
                      checked={settings.hidden}
                      onCheckedChange={(checked) => updateSettings({ hidden: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t('optimize_performance')}</Label>
                    <Switch
                      checked={settings.optimized}
                      onCheckedChange={(checked) => updateSettings({ optimized: checked })}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={resetSettings}
                  >
                    {t('reset_to_default')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}