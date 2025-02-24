import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen p-4">
      <BackButton />

      <div className="mt-4 -mt-4">
        <Card className="bg-black/40">
          <CardContent className="p-4">
            <h2 className="text-xl font-medium mb-4">{t('about_app')}</h2>
            <p className="text-white/70 mb-2">{t('version')}</p>

            <div className="space-y-4 mt-6">
              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <ul className="list-disc list-inside text-white/70">
                  <li>Multi-language support</li>
                  <li>Telegram integration</li>
                  <li>Cryptocurrency features</li>
                  <li>Article management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}