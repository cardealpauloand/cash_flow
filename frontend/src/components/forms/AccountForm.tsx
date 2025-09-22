import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, PiggyBank, Smartphone } from "lucide-react";
interface AccountFormProps {
  onSubmit: (account: any) => void;
  onCancel: () => void;
  initialData?: {
    id?: string;
    name: string;
    type: string;
    balance: number;
  };
  isEditing?: boolean;
}
const AccountForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: AccountFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "",
    balance: initialData?.balance?.toString() || "",
  });
  const accountTypes = [
    { value: "corrente", label: "Conta Corrente", icon: CreditCard },
    { value: "poupanca", label: "Poupança", icon: PiggyBank },
    { value: "carteira", label: "Carteira", icon: Wallet },
    { value: "cartao", label: "Cartão de Crédito", icon: Smartphone },
  ];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = {
      ...(initialData?.id && { id: initialData.id }),
      ...formData,
      balance: parseFloat(formData.balance) || 0,
    };
    onSubmit(account);
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const selectedAccountType = accountTypes.find(
    (type) => type.value === formData.type
  );
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Conta" : "Nova Conta"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta *</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank, Santander, Carteira..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Conta *</Label>
            <Select
              onValueChange={(value) => handleInputChange("type", value)}
              value={formData.type}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedAccountType && (
            <div className="p-4 rounded-lg bg-muted/30 flex items-center space-x-3">
              <selectedAccountType.icon className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">{selectedAccountType.label}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAccountType.value === "corrente" &&
                    "Conta para movimentação diária"}
                  {selectedAccountType.value === "poupanca" &&
                    "Conta para guardar dinheiro"}
                  {selectedAccountType.value === "carteira" &&
                    "Dinheiro em espécie"}
                  {selectedAccountType.value === "cartao" &&
                    "Cartão de crédito ou débito"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo Inicial</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.balance}
              onChange={(e) => handleInputChange("balance", e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Para cartões de crédito, use valores negativos para representar
              dívidas
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? "Salvar Alterações" : "Criar Conta"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default AccountForm;
