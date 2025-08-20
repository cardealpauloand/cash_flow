import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import { AuthPage } from "./pages/AuthPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="cashflow-theme">
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
