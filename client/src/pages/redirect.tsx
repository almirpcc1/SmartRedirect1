import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Redirect() {
  const { data, isLoading, error } = useQuery<{ url: string }>({
    queryKey: ["/api/redirect"],
    retry: false
  });

  useEffect(() => {
    if (data?.url) {
      window.location.href = data.url;
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum domínio ativo encontrado</p>
          <a href="/dashboard" className="text-primary hover:underline mt-2 block">
            Ir para o dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}