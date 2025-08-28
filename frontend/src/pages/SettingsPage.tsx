import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";
import { useApp, Currency, Language } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { User, Shield, Palette, Save, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { currency, language, setCurrency, setLanguage, t } = useApp();
  const { user, updateProfile } = useAuth();

  // Estados locais para as configurações
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempCurrency, setTempCurrency] = useState(currency);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dados do formulário de perfil
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Carrega dados reais do usuário
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    if (!profileData.name.trim()) {
      toast.error("Nome não pode ser vazio");
      return;
    }
    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim() || null,
      });
      toast.success("Perfil salvo");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar perfil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Estados dos switches
  const [security, setSecurity] = useState({
    sessionTimeout: true,
  });

  // Estados alterar senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Função para verificar mudanças
  const checkForChanges = (
    newTheme?: string,
    newCurrency?: Currency,
    newLanguage?: Language
  ) => {
    const themeChanged = (newTheme || tempTheme) !== theme;
    const currencyChanged = (newCurrency || tempCurrency) !== currency;
    const languageChanged = (newLanguage || tempLanguage) !== language;

    setHasUnsavedChanges(themeChanged || currencyChanged || languageChanged);
  };

  // Handlers para mudanças temporárias
  const handleThemeChange = (newTheme: string) => {
    setTempTheme(newTheme as typeof theme);
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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t("settings")}
          </h1>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscardChanges}
                  >
                    Descartar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    className="bg-gradient-primary hover:scale-105 transition-all duration-200"
                  >
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
          <Card className="shadow-card lg:col-span-3 hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{t("profile")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
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
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                className="w-full md:w-auto bg-gradient-primary hover:scale-105 transition-all duration-200"
                onClick={saveProfile}
                disabled={isSavingProfile}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSavingProfile ? "Salvando..." : `${t("save")} Perfil`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Appearance Settings */}
        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>{t("appearance")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("theme")}</Label>
                <Select value={tempTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="light">{t("light")}</SelectItem>
                    <SelectItem value="dark">{t("dark")}</SelectItem>
                    <SelectItem value="system">{t("system")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("language")}</Label>
                <Select
                  value={tempLanguage}
                  onValueChange={(value) =>
                    handleLanguageChange(value as Language)
                  }
                >
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
              <Select
                value={tempCurrency}
                onValueChange={(value) =>
                  handleCurrencyChange(value as Currency)
                }
              >
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
              <span>{t("security")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Alterar Senha</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha atual"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                disabled={isChangingPassword}
                onClick={async () => {
                  if (!currentPassword || !newPassword) {
                    toast.error("Preencha as duas senhas");
                    return;
                  }
                  if (newPassword.length < 6) {
                    toast.error("Nova senha deve ter ao menos 6 caracteres");
                    return;
                  }
                  if (currentPassword === newPassword) {
                    toast.error("Nova senha deve ser diferente da atual");
                    return;
                  }
                  try {
                    setIsChangingPassword(true);
                    await api.updateMe({
                      password: newPassword,
                      current_password: currentPassword,
                    });
                    toast.success("Senha alterada com sucesso");
                    setCurrentPassword("");
                    setNewPassword("");
                  } catch (e: unknown) {
                    const msg =
                      e instanceof Error ? e.message : "Erro ao alterar senha";
                    toast.error(msg);
                  } finally {
                    setIsChangingPassword(false);
                  }
                }}
                variant="outline"
                className="w-full md:w-auto hover:bg-primary/10 transition-all duration-200"
              >
                {isChangingPassword ? "Salvando..." : "Alterar Senha"}
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
                onCheckedChange={(checked) =>
                  setSecurity((prev) => ({ ...prev, sessionTimeout: checked }))
                }
              />
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
              ${
                hasUnsavedChanges
                  ? "bg-gradient-primary hover:scale-105"
                  : "opacity-50 cursor-not-allowed"
              } 
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
