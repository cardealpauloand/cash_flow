import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import {
  User,
  Camera,
  Save,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useApp();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: "1990-01-01",
    location: "São Paulo, SP",
    bio: "Entusiasta de finanças pessoais e investimentos.",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [pwError, setPwError] = useState<string>("");
  const { data: accountsList } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.list(),
  });
  const accountsCount = accountsList?.length || 0;
  const { data: txCountRes } = useQuery({
    queryKey: ["transactions", "count"],
    queryFn: () => api.transactions.count(),
  });
  const transactionsCount = txCountRes?.count || 0;
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cashflow-profile-extras");
      const extras = raw ? JSON.parse(raw) : {};
      setProfileData((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        dateOfBirth: extras.dateOfBirth || prev.dateOfBirth,
        location: extras.location || prev.location,
        bio: extras.bio || prev.bio,
      }));
    } catch {
      setProfileData((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      }));
    }
  }, [user?.name, user?.email, user?.phone]);
  const handleSave = async () => {
    try {
      await updateProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim() || null,
      });
      localStorage.setItem(
        "cashflow-profile-extras",
        JSON.stringify({
          dateOfBirth: profileData.dateOfBirth,
          location: profileData.location,
          bio: profileData.bio,
        })
      );
      toast.success("Perfil atualizado com sucesso!", {
        description: "Suas informações foram salvas.",
        duration: 3000,
      });
      setIsEditing(false);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || "Erro ao atualizar o perfil.");
    }
  };
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie suas informações pessoais e preferências da conta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                      {user && getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    {user?.name}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conta Verificada
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {profileData.bio}
                </p>
                <Separator />
                <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {accountsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Contas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {transactionsCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Transações</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card lg:col-span-2 hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Nome Completo</span>
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Telefone</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Data de Nascimento</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Localização</span>
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Input
                  id="bio"
                  value={profileData.bio}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Conte um pouco sobre você..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-primary hover:scale-105 transition-all duration-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card hover:shadow-hover transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Segurança da Conta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Email Verificado</h4>
                <p className="text-sm text-muted-foreground">
                  Seu email está verificado
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold">2FA Recomendado</h4>
                <p className="text-sm text-muted-foreground">
                  Configure para mais segurança
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Senha Forte</h4>
                <p className="text-sm text-muted-foreground">
                  Última alteração: há 30 dias
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-semibold mb-4">Alterar Senha</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    placeholder="Sua senha atual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.next}
                    onChange={(e) =>
                      setPasswords({ ...passwords, next: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
              {pwError && (
                <p className="text-sm text-destructive mt-2">{pwError}</p>
              )}
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={async () => {
                    setPwError("");
                    if (!passwords.current) {
                      const msg = "Informe a senha atual.";
                      setPwError(msg);
                      toast.error(msg);
                      return;
                    }
                    if (!passwords.next || passwords.next.length < 6) {
                      const msg =
                        "A nova senha deve ter pelo menos 6 caracteres.";
                      setPwError(msg);
                      toast.error(msg);
                      return;
                    }
                    if (passwords.next !== passwords.confirm) {
                      const msg = "As senhas não conferem.";
                      setPwError(msg);
                      toast.error(msg);
                      return;
                    }
                    try {
                      setIsSavingPassword(true);
                      await api.updateMe({
                        password: passwords.next,
                        current_password: passwords.current,
                      });
                      toast.success("Senha alterada com sucesso.");
                      setPasswords({ current: "", next: "", confirm: "" });
                      setPwError("");
                    } catch (e) {
                      const err = e as Error;
                      setPwError(err.message || "Erro ao alterar a senha.");
                      toast.error(err.message || "Erro ao alterar a senha.");
                    } finally {
                      setIsSavingPassword(false);
                    }
                  }}
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "Salvando..." : "Alterar Senha"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
export default ProfilePage;
