import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Calendar, Youtube, Edit } from "lucide-react";
import { ProjetoWithRelations } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarLayout } from "@/hooks/use-sidebar-layout";

export default function Finalizados() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { mainContentClass } = useSidebarLayout();
  const [editingProject, setEditingProject] = useState<ProjetoWithRelations | null>(null);
  const [youtubeLink, setYoutubeLink] = useState("");

  const { data: projetos = [], isLoading } = useQuery<ProjetoWithRelations[]>({
    queryKey: ["/api/projetos", { status: "Aprovado" }],
    queryFn: async () => {
      const response = await fetch("/api/projetos?status=Aprovado", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Erro ao carregar projetos finalizados");
      return response.json();
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, linkYoutube }: { id: string; linkYoutube: string }) => {
      const response = await apiRequest("PATCH", `/api/projetos/${id}`, { linkYoutube });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projetos"] });
      toast({
        title: "Link do YouTube atualizado!",
        description: "O link foi salvo com sucesso.",
      });
      setEditingProject(null);
      setYoutubeLink("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditYoutubeLink = (projeto: ProjetoWithRelations) => {
    setEditingProject(projeto);
    setYoutubeLink(projeto.linkYoutube || "");
  };

  const handleSaveYoutubeLink = () => {
    if (!editingProject) return;
    
    // Basic YouTube URL validation
    if (youtubeLink && !youtubeLink.includes('youtube.com') && !youtubeLink.includes('youtu.be')) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do YouTube.",
        variant: "destructive",
      });
      return;
    }

    updateProjectMutation.mutate({ 
      id: editingProject.id, 
      linkYoutube: youtubeLink 
    });
  };

  const canEdit = (projeto: ProjetoWithRelations) => {
    if (user?.papel === "Admin" || user?.papel === "Gestor") return true;
    return user?.id === projeto.responsavelId;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className={`${mainContentClass} flex flex-col flex-1 transition-all duration-300`}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-40 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className={`${mainContentClass} flex flex-col flex-1 overflow-hidden transition-all duration-300`}>
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border shadow-sm">
          <div className="flex-1 px-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-foreground" data-testid="finalizados-title">
                Projetos Finalizados
              </h1>
              <Badge className="bg-chart-4 text-white" data-testid="finalizados-count">
                {projetos.length} projetos
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-6">
              
              {projetos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Youtube className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">Nenhum projeto finalizado ainda</p>
                    <p className="text-sm">Os projetos aprovados aparecerão aqui.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projetos.map((projeto) => (
                    <Card key={projeto.id} className="hover:shadow-lg transition-shadow" data-testid={`finalized-project-${projeto.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-foreground line-clamp-2" data-testid="project-title">
                            {projeto.titulo}
                          </h3>
                          <Badge className="bg-chart-4 text-white">
                            Finalizado
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {projeto.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-3" data-testid="project-description">
                            {projeto.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" data-testid="project-type">
                            {projeto.tipoVideo?.nome}
                          </Badge>
                          {projeto.prioridade && (
                            <Badge variant={projeto.prioridade === "Alta" ? "destructive" : "secondary"} data-testid="project-priority">
                              {projeto.prioridade}
                            </Badge>
                          )}
                        </div>

                        {projeto.tags && projeto.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1" data-testid="project-tags">
                            {projeto.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {projeto.responsavel?.nome?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate" data-testid="project-responsible">
                              {projeto.responsavel?.nome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Responsável
                            </p>
                          </div>
                        </div>

                        {projeto.dataAprovacao && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span data-testid="approval-date">
                              Aprovado em {format(new Date(projeto.dataAprovacao), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}

                        {projeto.cliente && (
                          <div className="text-sm text-muted-foreground" data-testid="project-client">
                            <strong>Cliente:</strong> {projeto.cliente.nome}
                          </div>
                        )}

                        {/* YouTube Link Section */}
                        <div className="border-t pt-4">
                          {projeto.linkYoutube ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Link do YouTube:</span>
                                {canEdit(projeto) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditYoutubeLink(projeto)}
                                    data-testid="edit-youtube-link"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <a
                                href={projeto.linkYoutube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-chart-1 hover:underline"
                                data-testid="youtube-link"
                              >
                                <Youtube className="w-4 h-4 mr-2" />
                                Ver no YouTube
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          ) : (
                            canEdit(projeto) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditYoutubeLink(projeto)}
                                className="w-full"
                                data-testid="add-youtube-link"
                              >
                                <Youtube className="w-4 h-4 mr-2" />
                                Adicionar Link do YouTube
                              </Button>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* YouTube Link Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent data-testid="youtube-dialog">
          <DialogHeader>
            <DialogTitle>Editar Link do YouTube</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL do YouTube</label>
              <Input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                data-testid="youtube-url-input"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingProject(null)}
                data-testid="cancel-youtube-edit"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveYoutubeLink}
                disabled={updateProjectMutation.isPending}
                data-testid="save-youtube-link"
              >
                {updateProjectMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
