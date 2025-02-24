import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function DonatePage() {
  const { t } = useTranslation();
  const { isConnected, connect } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState(1);

  const handleDonate = async () => {
    if (!isConnected) {
      try {
        await connect();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to connect wallet",
          variant: "destructive",
        });
        return;
      }
    }

    // Here we would implement actual donation logic
    toast({
      title: "Success",
      description: `Thank you for your ${amount} TON donation!`,
    });
  };

  return (
    <div className="min-h-screen p-4">
      <BackButton />

      <div className="mt-8 space-y-4">
        <Card className="bg-black/40">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20"
              >
                <Heart className="w-8 h-8 text-red-500" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-lg font-medium mb-2">{t('donate')}</h2>
                <p className="text-sm text-white/60">
                  {t('donate_desc')}
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">{t('amount')}</span>
                  <span className="font-mono">{amount} TON</span>
                </div>

                <Slider
                  value={[amount]}
                  onValueChange={([value]) => setAmount(value)}
                  min={1}
                  max={100}
                  step={1}
                />

                <Button
                  className="w-full mt-4"
                  onClick={handleDonate}
                >
                  {isConnected ? t('donate') : t('connect_wallet')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
