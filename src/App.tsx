// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./components/LoginPage";
import { SharedProfileView } from "./components/SharedProfileView";
import { CustomerPortal } from "./components/CustomerPortal";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
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
  if (loading) {
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
          <BrowserRouter>
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

              {/* Fluxo principal antigo */}
              <Route path="/" element={<Index />} />

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

              {/* Demais rotas */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
