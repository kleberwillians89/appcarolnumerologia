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
import { ProductCatalogPage } from "./components/ProductCatalogPage";
import { AppProvider } from "./contexts/AppContext";
import { Delivery, deliveryService } from "./services/deliveryService";

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
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const authTimedOut = useRouteAuthTimeout(loading);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (!user) {
    // guarda a rota que o usuário queria e manda p/ login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();
  const authTimedOut = useRouteAuthTimeout(loading);
  console.log('SESSÃO ATUAL - ROLE:', (user as any)?.role || role);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/entregas" replace />;
  }

  if (role === 'cliente') {
    return <Navigate to="/portal" replace />;
  }

  return <Navigate to="/login" replace />;
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
  if (!role) {
    return <Navigate to="/login" replace />;
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
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'admin') {
    return <Navigate to="/entregas" replace />;
  }
  return children;
}

function ClientStoreFlow() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeliveries = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      setDeliveries(await deliveryService.fetchDeliveriesForCurrentUser(user.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDeliveries();

    const handleUpdate = () => void loadDeliveries();
    window.addEventListener('deliveriesUpdated', handleUpdate);
    return () => window.removeEventListener('deliveriesUpdated', handleUpdate);
  }, [user?.id]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando loja...</div>;
  }

  const activeDelivery = deliveries[0];

  if (!activeDelivery) {
    return <ProductCatalogPage onOrderCreated={loadDeliveries} />;
  }

  if (activeDelivery.status === 'AGUARDANDO_PAGAMENTO') {
    return (
      <div className="min-h-screen bg-[#050B1A] px-4 py-10 text-[#F8F5EF]">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#C9A96E]/35 bg-[#0B1426]/95 p-6 shadow-xl shadow-black/20">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#C9A96E]">PEDIDO REGISTRADO</p>
          <h1 className="mt-3 text-2xl font-bold text-white">Seu pedido foi registrado!</h1>
          <p className="mt-3 text-[#F8F5EF]/75">
            Aguarde a confirmação do pagamento para liberar seu formulário.
          </p>
        </div>
      </div>
    );
  }

  return <CustomerPortal />;
}

function RedirectIfAuthenticated({ children }: { children: JSX.Element }) {
  const { user, role, loading } = useAuth();
  const authTimedOut = useRouteAuthTimeout(loading);
  console.log('SESSÃO ATUAL - ROLE:', (user as any)?.role || role);

  if (loading && !authTimedOut) {
    return <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">Carregando sessão...</div>;
  }
  if (user && role) {
    return <RoleRedirect />;
  }
  if (user && !role) {
    return <Navigate to="/login" replace />;
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
                path="/loja"
                element={
                  <RequireCliente>
                    <Navigate to="/portal" replace />
                  </RequireCliente>
                }
              />

              <Route
                path="/portal"
                element={
                  <RequireCliente>
                    <ClientStoreFlow />
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
