import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { initTelegram, preventClosingBySwipe } from "./lib/telegram";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import StarfieldBackground from "./components/StarfieldBackground";
import Navigation from "./components/Navigation";
import { StarfieldProvider } from "./contexts/StarfieldContext";
import { WalletProvider } from "./contexts/WalletContext";

// Pages
import Articles from "./pages/Articles";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Menu from "./pages/Menu";
import Statistics from "./pages/Statistics";
import SavedArticles from "./pages/SavedArticles";
import NotFound from "./pages/not-found";
import Crypto from "./pages/Crypto";
import CryptoDetail from "./pages/CryptoDetail";
import Wallet from "./pages/Wallet";
import Donate from "./pages/Donate";
import NewArticle from "./pages/NewArticle";

// i18n
import "./lib/i18n";

function Router() {
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (window.location.pathname === '/') {
      setLocation('/profile');
    }
  }, [setLocation]);

  return (
    <Switch>
      <Route path="/" component={Profile} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/new" component={NewArticle} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/menu" component={Menu} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/saved-articles" component={SavedArticles} />
      <Route path="/crypto" component={Crypto} />
      <Route path="/crypto/:id" component={CryptoDetail} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/donate" component={Donate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    try {
      initTelegram();
      preventClosingBySwipe();
    } catch (error) {
      console.error("Failed to initialize Telegram:", error);
    }

    const style = document.createElement('style');
    style.textContent = `
      [plugin:runtime-error-plugin] { display: none !important; }
      .vite-error-overlay { display: none !important; }
    `;
    document.head.appendChild(style);

    window.onerror = function(msg, url, line, col, error) {
      console.error('Global error:', {
        message: msg,
        url,
        line,
        col,
        error: error?.stack
      });
      return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StarfieldProvider>
        <WalletProvider>
          <div className="text-white min-h-screen pb-24">
            <StarfieldBackground />
            <Router />
            <Navigation />
          </div>
          <Toaster />
        </WalletProvider>
      </StarfieldProvider>
    </QueryClientProvider>
  );
}

export default App;