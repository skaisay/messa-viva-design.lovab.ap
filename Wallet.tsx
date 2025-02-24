import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export default function WalletPage() {
  const { t } = useTranslation();
  const { isConnected, connect, disconnect, address } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: t('wallet_connected'),
        description: address,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    }
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
                className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/20"
              >
                <Wallet className="w-8 h-8 text-primary" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-lg font-medium mb-2">{t('telegram_wallet')}</h2>
                <p className="text-sm text-white/60">
                  {isConnected ? t('wallet_connected') : t('wallet_not_connected')}
                </p>
                {address && (
                  <p className="mt-2 text-xs font-mono bg-black/20 px-3 py-2 rounded">
                    {address}
                  </p>
                )}
              </div>

              <Button
                variant={isConnected ? "destructive" : "default"}
                className="w-full"
                onClick={isConnected ? disconnect : handleConnect}
              >
                {isConnected ? t('disconnect') : t('connect_wallet')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
