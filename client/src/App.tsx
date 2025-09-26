import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./components/ui/theme-provider";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Metrics from "@/pages/metrics";
import Finalizados from "@/pages/finalizados";
import NovoProjeto from "@/pages/novo-projeto";
import MinhaFila from "@/pages/minha-fila";
import Relatorios from "@/pages/relatorios";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/metricas" component={Metrics} />
      <ProtectedRoute path="/finalizados" component={Finalizados} />
      <ProtectedRoute path="/novo-projeto" component={NovoProjeto} />
      <ProtectedRoute path="/minha-fila" component={MinhaFila} />
      <ProtectedRoute path="/relatorios" component={Relatorios} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="videoflow-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
