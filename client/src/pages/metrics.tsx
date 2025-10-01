import { useQuery } from "@tanstack/react-query";
import { useSidebarLayout } from "@/hooks/use-sidebar-layout";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Video, AlertTriangle } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Metrics() {
  const { mainContentClass } = useSidebarLayout();
  const { data: metricas, isLoading } = useQuery<any>({
    queryKey: ["/api/metricas"],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    refetchOnWindowFocus: true, // Atualiza quando volta ao foco da janela
    refetchOnReconnect: true, // Atualiza quando reconecta à internet
    staleTime: 0, // Dados sempre considerados desatualizados para forçar refetch
  });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className={`${mainContentClass} flex flex-col flex-1 transition-all duration-300`}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-20 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusData = Object.entries(metricas?.projetosPorStatus || {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const responsavelData = Object.entries(metricas?.projetosPorResponsavel || {}).map(([responsavel, count]) => ({
    name: responsavel,
    projetos: count,
  }));

  const tipoData = Object.entries(metricas?.projetosPorTipo || {}).map(([tipo, count]) => ({
    name: tipo,
    projetos: count,
  }));

  const clienteData = Object.entries(metricas?.videosPorCliente || {}).map(([cliente, count]) => ({
    name: cliente,
    videos: count,
  }));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className={`${mainContentClass} flex flex-col flex-1 overflow-hidden transition-all duration-300`}>
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          <div className="flex-1 px-6 flex items-center">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="metrics-title">
              Métricas
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-6 space-y-6">
              
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="total-projects">
                      {metricas?.totalProjetos || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Excluindo aprovados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projetos Aprovados</CardTitle>
                    <TrendingUp className="h-4 w-4 text-chart-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-4" data-testid="approved-projects">
                      {metricas?.projetosAprovados || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Projetos finalizados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                    <Users className="h-4 w-4 text-chart-1" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-1" data-testid="active-projects">
                      {metricas?.projetosAtivos || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Em produção
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Projetos Atrasados</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive" data-testid="overdue-projects">
                      {metricas?.projetosAtrasados || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Precisam de atenção
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-2" data-testid="completion-rate">
                      {(metricas?.totalProjetos || 0) + (metricas?.projetosAprovados || 0) > 0 
                        ? Math.round(((metricas?.projetosAprovados || 0) / ((metricas?.totalProjetos || 0) + (metricas?.projetosAprovados || 0))) * 100)
                        : 0
                      }%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Taxa geral
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
                    <Users className="h-4 w-4 text-chart-3" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-3" data-testid="active-members">
                      {Object.keys(metricas?.projetosPorResponsavel || {}).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Produtividade
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Status</CardTitle>
                    <CardDescription>
                      Quantidade de projetos em cada etapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Projects by Responsible */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projetos por Responsável</CardTitle>
                    <CardDescription>
                      Distribuição de trabalho na equipe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={responsavelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="projetos" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Projects by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projetos por Tipo de Vídeo</CardTitle>
                    <CardDescription>
                      Tipos de conteúdo mais produzidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={tipoData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="projetos" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Videos by Client */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vídeos por Cliente</CardTitle>
                    <CardDescription>
                      Distribuição de projetos por cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clienteData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="videos" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Status Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo por Status</CardTitle>
                    <CardDescription>
                      Visão detalhada do pipeline de projetos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(metricas?.projetosPorStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status}</span>
                        <Badge variant="secondary" data-testid={`status-count-${status}`}>
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
