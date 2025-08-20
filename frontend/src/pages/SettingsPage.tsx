import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { useApp, Currency, Language } from "@/contexts/AppContext";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Upload,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { currency, language, setCurrency, setLanguage, t } = useApp();

  // Estados locais para as configurações
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempCurrency, setTempCurrency] = useState(currency);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dados do formulário de perfil
  const [profileData, setProfileData] = useState({
    firstName: "João",
    lastName: "Silva",
    email: "joao.silva@email.com",
    phone: "+55 (11) 99999-9999"
  });

  // Estados dos switches
  const [notifications, setNotifications] = useState({
    email: true,
    budget: true,
    transactions: false
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: true,
    autoBackup: true,
    dataRetention: "2years"
  });

  const [security, setSecurity] = useState({
    sessionTimeout: true
  });

  // Função para verificar mudanças
  const checkForChanges = (newTheme?: string, newCurrency?: Currency, newLanguage?: Language) => {
    const themeChanged = (newTheme || tempTheme) !== theme;
    const currencyChanged = (newCurrency || tempCurrency) !== currency;
    const languageChanged = (newLanguage || tempLanguage) !== language;
    
    setHasUnsavedChanges(themeChanged || currencyChanged || languageChanged);
  };

  // Handlers para mudanças temporárias
  const handleThemeChange = (newTheme: string) => {
    setTempTheme(newTheme as any);
    checkForChanges(newTheme, undefined, undefined);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setTempCurrency(newCurrency);
    checkForChanges(undefined, newCurrency, undefined);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setTempLanguage(newLanguage);
    checkForChanges(undefined, undefined, newLanguage);
  };

  // Função para salvar todas as configurações
  const handleSaveChanges = () => {
    setTheme(tempTheme);
    setCurrency(tempCurrency);
    setLanguage(tempLanguage);
    setHasUnsavedChanges(false);
    
    toast.success("Configurações salvas com sucesso!", {
      description: "Todas as suas preferências foram aplicadas.",
      duration: 3000,
    });
  };

  // Função para descartar mudanças
  const handleDiscardChanges = () => {
    setTempTheme(theme);
    setTempCurrency(currency);
    setTempLanguage(language);
    setHasUnsavedChanges(false);
    
    toast.info("Mudanças descartadas", {
      description: "As configurações voltaram ao estado anterior.",
      duration: 2000,
    });
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('settings')}</h1>
          <p className="text-muted-foreground text-lg">
            Personalize sua experiência no Cash Flow
          </p>
        </div>

        {/* Botão de salvar fixo */}
        {hasUnsavedChanges && (
          <Card className="shadow-card bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20 animate-scale-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <p className="font-medium text-foreground">
                    Você tem alterações não salvas
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDiscardChanges}>
                    Descartar
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges} className="bg-gradient-primary hover:scale-105 transition-all duration-200">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Tudo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <Card className="shadow-card lg:col-span-2 hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{t('profile')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input 
                    id="firstName" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input 
                    id="lastName" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" 
                />
              </div>
              <Button className="w-full md:w-auto bg-gradient-primary hover:scale-105 transition-all duration-200">
                <Save className="w-4 h-4 mr-2" />
                {t('save')} Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-all duration-200">
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-all duration-200">
                <Upload className="w-4 h-4 mr-2" />
                Importar Transações
              </Button>
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-all duration-200">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Contas
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full justify-start hover:scale-105 transition-all duration-200">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Settings */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>{t('notifications')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba resumos mensais e alertas importantes por email
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="budget-alerts">Alertas de Orçamento</Label>
                <p className="text-sm text-muted-foreground">
                  Seja notificado quando exceder limites de gastos
                </p>
              </div>
              <Switch 
                id="budget-alerts" 
                checked={notifications.budget}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, budget: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="transaction-notifications">Confirmação de Transações</Label>
                <p className="text-sm text-muted-foreground">
                  Receba confirmações para todas as transações
                </p>
              </div>
              <Switch 
                id="transaction-notifications" 
                checked={notifications.transactions}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, transactions: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>{t('appearance')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t('theme')}</Label>
                <Select value={tempTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="light">{t('light')}</SelectItem>
                    <SelectItem value="dark">{t('dark')}</SelectItem>
                    <SelectItem value="system">{t('system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('language')}</Label>
                <Select value={tempLanguage} onValueChange={(value) => handleLanguageChange(value as Language)}>
                  <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Moeda Padrão</Label>
              <Select value={tempCurrency} onValueChange={(value) => handleCurrencyChange(value as Currency)}>
                <SelectTrigger className="md:w-1/2 transition-all duration-200 hover:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>{t('security')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Badge variant="secondary">Não configurado</Badge>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Alterar Senha</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="password" placeholder="Senha atual" className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                <Input type="password" placeholder="Nova senha" className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
              </div>
              <Button variant="outline" className="w-full md:w-auto hover:bg-primary/10 transition-all duration-200">
                Alterar Senha
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="session-timeout">Timeout de Sessão</Label>
                <p className="text-sm text-muted-foreground">
                  Desconectar automaticamente após inatividade
                </p>
              </div>
              <Switch 
                id="session-timeout" 
                checked={security.sessionTimeout}
                onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, sessionTimeout: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Dados e Privacidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Compartilhamento de Dados</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir análises anônimas para melhorar o serviço
                </p>
              </div>
              <Switch 
                checked={privacy.dataSharing}
                onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataSharing: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Fazer backup dos seus dados automaticamente
                </p>
              </div>
              <Switch 
                checked={privacy.autoBackup}
                onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, autoBackup: checked }))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Período de Retenção de Dados</Label>
              <Select 
                value={privacy.dataRetention}
                onValueChange={(value) => setPrivacy(prev => ({ ...prev, dataRetention: value }))}
              >
                <SelectTrigger className="md:w-1/2 transition-all duration-200 hover:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="1year">1 ano</SelectItem>
                  <SelectItem value="2years">2 anos</SelectItem>
                  <SelectItem value="5years">5 anos</SelectItem>
                  <SelectItem value="indefinite">Indefinido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Botão final de salvar */}
        <div className="flex justify-center pb-8">
          <Button 
            size="lg" 
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
            className={`
              ${hasUnsavedChanges ? 'bg-gradient-primary hover:scale-105' : 'opacity-50 cursor-not-allowed'} 
              transition-all duration-200 px-8 py-4 text-lg
            `}
          >
            <CheckCircle className="w-5 h-5 mr-3" />
            Salvar Todas as Configurações
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;