// src/App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginPage";
import { SharedProfileView } from "./components/SharedProfileView";
import AppLayout from "./components/AppLayout";
import { CustomerPortal } from "./components/CustomerPortal";
import { AppProvider } from "./contexts/AppContext";

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

function RoleRedirect() {
  const { role, loading } = useAuth();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }

  return <Navigate to={role === 'admin' ? '/entregas' : '/portal'} replace />;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/portal" replace />;
  }
  return children;
}

function RequireCliente({ children }: { children: JSX.Element }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role === 'admin') {
    return <Navigate to="/entregas" replace />;
  }
  return children;
}

function RedirectIfAuthenticated({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (user) {
    return <RoleRedirect />;
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
                    <RoleRedirect />
                  </RequireAuth>
                }
              />

              <Route
                path="/entregas"
                element={
                  <RequireAdmin>
                    <AppProvider>
                      <AppLayout initialTab="deliveries" />
                    </AppProvider>
                  </RequireAdmin>
                }
              />

              <Route
                path="/portal"
                element={
                  <RequireCliente>
                    <CustomerPortal />
                  </RequireCliente>
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
