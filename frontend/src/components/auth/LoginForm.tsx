import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { t } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(email, password);
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso",
      });
      // Redirecionar para a página inicial após login bem-sucedido
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-hover">
      <CardHeader className="text-center space-y-1">
        <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-glow-pulse mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-2xl">CF</span>
        </div>
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:scale-105 transition-all duration-200 shadow-glow"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary-glow"
              onClick={onSwitchToRegister}
            >
              Criar conta
            </Button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Demo:</strong> admin@cashflow.com / 123456
          </p>
        </div>
      </CardContent>
    </Card>
  );
};