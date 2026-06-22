import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import AppLayout from './components/AppLayout';
import LoginPage from './components/LoginPage';
import { CustomerPortal } from './components/CustomerPortal';
import { ProductCatalogPage } from './components/ProductCatalogPage';
import { ProductIntakePage } from './components/ProductIntakePage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { SharedProfileView } from './components/SharedProfileView';
import NotFound from './pages/NotFound';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Delivery, deliveryService } from './services/deliveryService';

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050B1A] px-4 text-center text-[#F8F5EF]">
      Carregando...
    </div>
  );
}

function useCustomerDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeliveries = useCallback(async () => {
    if (!user?.id) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await deliveryService.fetchDeliveriesForCurrentUser(user.id);
      setDeliveries(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDeliveries();

    const handleUpdate = () => void loadDeliveries();
    window.addEventListener('deliveriesUpdated', handleUpdate);
    return () => window.removeEventListener('deliveriesUpdated', handleUpdate);
  }, [loadDeliveries]);

  return { deliveries, loading, reload: loadDeliveries };
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/entregas" replace />;
  if (role === 'cliente') return <CustomerEntryRedirect />;

  return <Navigate to="/login" replace />;
}

function CustomerEntryRedirect() {
  const { deliveries, loading } = useCustomerDeliveries();

  if (loading) return <LoadingScreen />;
  if (deliveries.length > 0) return <Navigate to="/portal" replace />;

  return <Navigate to="/loja" replace />;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (role === 'admin') return children;
  if (role === 'cliente') return <Navigate to="/loja" replace />;

  return <Navigate to="/admin/login" replace />;
}

function RequireCliente({ children }: { children: JSX.Element }) {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'cliente') return children;
  if (role === 'admin') return <Navigate to="/entregas" replace />;

  return <Navigate to="/login" replace />;
}

function RedirectIfAuthenticated({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <RoleRedirect />;

  return children;
}

function StoreRoute() {
  return <ProductCatalogPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />

      <Route
        path="/admin/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage adminOnly />
          </RedirectIfAuthenticated>
        }
      />

      <Route path="/" element={<RoleRedirect />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            <StoreRoute />
          </RequireCliente>
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

      <Route
        path="/contratar/:productId"
        element={
          <RequireCliente>
            <ProductIntakePage />
          </RequireCliente>
        }
      />

      <Route path="/shared/:shareId" element={<SharedProfileView />} />

      <Route
        path="*"
        element={
          <RequireAdmin>
            <NotFound />
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
