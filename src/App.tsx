// src/App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginPage";
import { SharedProfileView } from "./components/SharedProfileView";
import { CustomerPortal } from "./components/CustomerPortal";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();
const ROUTE_AUTH_TIMEOUT_MS = 3000;

function useRouteAuthTimeout(loading: boolean) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setTimedOut(true), ROUTE_AUTH_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [loading]);

  return timedOut;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (!user) {
    // guarda a rota que o usuário queria e manda p/ login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RedirectIfAuthenticated({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (user) {
    // se já está logado, não precisa ver /login
    const to = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={to} replace />;
  }
  return children;
}

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              {/* Tela de Login (com redirecionamento se já estiver logado) */}
              <Route
                path="/login"
                element={
                  <RedirectIfAuthenticated>
                    <LoginPage />
                  </RedirectIfAuthenticated>
                }
              />

              {/* App principal protegido */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Index />
                  </RequireAuth>
                }
              />

              {/* Área do cliente preservada, sem bloquear o fluxo principal */}
              <Route
                path="/portal"
                element={
                  <RequireAuth>
                    <CustomerPortal />
                  </RequireAuth>
                }
              />

              {/* Shared Profile View (Public) */}
              <Route path="/shared/:shareId" element={<SharedProfileView />} />

              {/* Demais rotas protegidas */}
              <Route
                path="*"
                element={
                  <RequireAuth>
                    <NotFound />
                  </RequireAuth>
                }
              />

            </Routes>
          </HashRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
