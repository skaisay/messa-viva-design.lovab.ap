import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

const timeRanges = [
  { label: '1мин', days: 1/1440 },
  { label: '5мин', days: 5/1440 },
  { label: '15мин', days: 15/1440 },
  { label: '1Ч', days: 1/24 },
  { label: '24Ч', days: 1 },
  { label: '7Д', days: 7 },
  { label: '30Д', days: 30 },
  { label: '6М', days: 180 },
  { label: '1Г', days: 365 },
];

const formatLargeNumber = (num: number) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

export default function CryptoDetail({ params }: { params: { id: string } }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState(timeRanges[3]);
  const chartRef = useRef<ChartJS<"line">>(null);

  const { data: cryptoDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['crypto-detail', params.id],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${params.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
          {
            headers: {
              'x-cg-demo-api-key': 'CG-ZqeeBVXCUhvfFUmZ2hrMNZS4'
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch crypto details');
        return response.json();
      } catch (error) {
        console.error('Error fetching crypto details:', error);
        toast({
          title: "Error",
          description: "Failed to load cryptocurrency details",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 2,
  });

  const { data: priceHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['crypto-history', params.id, selectedRange.days],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${params.id}/market_chart?vs_currency=usd&days=${selectedRange.days}`,
          {
            headers: {
              'x-cg-demo-api-key': 'CG-ZqeeBVXCUhvfFUmZ2hrMNZS4'
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch price history');
        return response.json();
      } catch (error) {
        console.error('Error fetching price history:', error);
        toast({
          title: "Error",
          description: "Failed to load price history",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 2,
  });

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      // Configure zoom and pan options
      chart.options.plugins = {
        ...chart.options.plugins,
        zoom: {
          limits: {
            y: { min: 'original', max: 'original' }
          },
          pan: {
            enabled: true,
            mode: 'x',
            modifierKey: undefined
          },
          zoom: {
            wheel: {
              enabled: true,
              // Fix: Changed from null to undefined for TypeScript compatibility
              modifierKey: undefined
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
          }
        }
      };

      // Prevent default touch behavior for smoother chart interaction
      const canvas = chart.canvas;
      if (canvas) {
        const preventScroll = (e: TouchEvent) => {
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        };

        canvas.addEventListener('touchstart', preventScroll, { passive: false });
        canvas.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
          canvas.removeEventListener('touchstart', preventScroll);
          canvas.removeEventListener('touchmove', preventScroll);
        };
      }
    }
  }, []);

  const handleResetZoom = () => {
    const chart = chartRef.current;
    if (chart) {
      chart.resetZoom();
    }
  };

  if (isLoadingDetail || isLoadingHistory) {
    return (
      <div className="min-h-screen p-4">
        <BackButton />
        <div className="mt-12 text-center">
          <p className="text-white/60">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!cryptoDetail || !priceHistory) {
    return (
      <div className="min-h-screen p-4">
        <BackButton />
        <div className="mt-12 text-center">
          <p className="text-red-400">{t('error_loading')}</p>
        </div>
      </div>
    );
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          label: (context) => {
            if (typeof context.parsed.y === 'number') {
              return `$${context.parsed.y.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            }
            return '';
          },
          title: (tooltipItems) => {
            if (tooltipItems.length > 0) {
              const date = new Date(tooltipItems[0].parsed.x);
              if (selectedRange.days <= 1/24) {
                return date.toLocaleTimeString([], { 
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
              } else if (selectedRange.days <= 1) {
                return date.toLocaleString([], { 
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
              return date.toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            return '';
          }
        },
      },
    },
    scales: {
      y: {
        position: 'right',
        border: {
          display: false
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          padding: 8,
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11,
            family: 'system-ui'
          },
          callback: (value) => {
            if (typeof value === 'number') {
              return `$${formatLargeNumber(value)}`;
            }
            return value;
          },
        },
      },
      x: {
        type: 'time',
        border: {
          display: false
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        time: {
          unit: selectedRange.days <= 1/24 ? 'minute' : 
                selectedRange.days <= 1 ? 'hour' : 'day',
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'dd MMM',
          },
          tooltipFormat: selectedRange.days <= 1 ? 'HH:mm:ss' : 'dd MMM yyyy HH:mm',
        },
        ticks: {
          maxTicksLimit: 6,
          padding: 8,
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 11,
            family: 'system-ui'
          },
        },
      }
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 20,
        hoverRadius: 4,
      },
      line: {
        tension: 0.2,
        borderWidth: 2,
      }
    },
  };

  const prices = priceHistory.prices;
  const chartData = {
    labels: prices.map((price: [number, number]) => new Date(price[0])),
    datasets: [{
      label: 'Price USD',
      data: prices.map((price: [number, number]) => ({
        x: new Date(price[0]),
        y: price[1]
      })),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
    }]
  };

  const priceChangeColor = cryptoDetail.market_data.price_change_percentage_24h >= 0
    ? 'text-green-400'
    : 'text-red-400';

  return (
    <motion.div 
      className="min-h-screen p-4 pb-20 prevent-scroll-chaining bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <BackButton />

      <div className="mt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={cryptoDetail.image.large}
                alt={cryptoDetail.name}
                className="w-8 h-8"
              />
              <div>
                <h2 className="text-xl font-medium">{cryptoDetail.name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-sm uppercase">{cryptoDetail.symbol}</p>
                  <span className={`text-sm ${priceChangeColor}`}>
                    {cryptoDetail.market_data.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-medium">
                ${cryptoDetail.market_data.current_price.usd.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 p-3 rounded-lg">
            <div>
              <p className="text-white/60 mb-1">{t('market_cap')}</p>
              <p className="font-medium">${formatLargeNumber(cryptoDetail.market_data.market_cap.usd)}</p>
            </div>
            <div>
              <p className="text-white/60 mb-1">{t('trading_volume')}</p>
              <p className="font-medium">${formatLargeNumber(cryptoDetail.market_data.total_volume.usd)}</p>
            </div>
          </div>
        </div>

        <Card className="bg-black/40 mt-4">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 smooth-scroll">
              {timeRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setSelectedRange(range);
                    const chart = chartRef.current;
                    if (chart) {
                      chart.resetZoom();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedRange.label === range.label
                      ? 'bg-white/20'
                      : 'bg-black/40 hover:bg-black/60'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="relative h-[60vh] sm:h-[500px]">
              <Line 
                ref={chartRef}
                data={chartData} 
                options={options}
                className="w-full h-full"
              />
              <button
                onClick={handleResetZoom}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium bg-black/40 hover:bg-black/60 rounded-full transition-colors"
              >
                {t('reset_zoom')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}