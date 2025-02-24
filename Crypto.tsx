import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function Crypto() {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();

  const { data: cryptocurrencies, isLoading } = useQuery<Cryptocurrency[]>({
    queryKey: ['cryptocurrencies'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=60&page=1&sparkline=false',
        {
          headers: {
            'x-cg-demo-api-key': 'CG-ZqeeBVXCUhvfFUmZ2hrMNZS4'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch cryptocurrencies');
      return response.json();
    },
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <BackButton />
        <div className="mt-12 text-center">
          <p className="text-white/60">Loading cryptocurrencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <BackButton />

      <div className="mt-8 space-y-4">
        {cryptocurrencies?.map((crypto) => (
          <Card 
            key={crypto.id} 
            className="bg-black/40 cursor-pointer hover:bg-black/50 transition-colors"
            onClick={() => setLocation(`/crypto/${crypto.id}`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={crypto.image} 
                  alt={crypto.name} 
                  className="w-8 h-8"
                />
                <div>
                  <h3 className="font-medium">{crypto.name}</h3>
                  <p className="text-sm text-white/60 uppercase">{crypto.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${crypto.current_price.toLocaleString()}</p>
                <p className={`text-sm ${
                  crypto.price_change_percentage_24h >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
