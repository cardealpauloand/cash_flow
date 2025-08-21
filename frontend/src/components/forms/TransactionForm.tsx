import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import SubCategoryManager, { SubCategory } from "./SubCategoryManager";
import InstallmentManager, { Installment } from "./InstallmentManager";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useAccounts } from "@/hooks/useAccounts";
import { api } from "@/lib/api";

export interface TransactionFormSubmitPayload {
  id?: string;
  type: string;
  description: string;
  amount: number;
  category?: string;
  account: string;
  date: string;
  tags?: string[];
  subCategories?: SubCategory[];
  installments?: Installment[];
}

// Payload real esperado pelo backend (simplificado)
interface BackendPayload {
  transaction_type: "income" | "expense" | "transfer";
  value: number;
  date: string;
  account_id: number;
  account_out_id?: number;
  notes?: string;
  category_id?: number;
  sub_category_id?: number;
  tags?: number[];
  subs?: Array<{
    value: number;
    category_id?: number;
    sub_category_id?: number;
  }>;
}

interface TransactionFormProps {
  onSubmit: (transaction: TransactionFormSubmitPayload) => void;
  onCancel: () => void;
  initialData?: TransactionFormSubmitPayload;
  isEditing?: boolean;
}

const TransactionForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: TransactionFormProps) => {
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>(
    initialData?.subCategories || []
  );
  const [installments, setInstallments] = useState<Installment[]>(
    initialData?.installments || []
  );
  const [formData, setFormData] = useState({
    type: initialData?.type || "",
    description: initialData?.description || "",
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
    account: initialData?.account || "",
  });

  const ref = useReferenceData();
  const accounts = useAccounts();

  useEffect(() => {
    console.log("Initial data loaded:", ref);
  }, [ref]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determinar o valor final baseado na prioridade: parcelas > subcategorias > valor direto
    let finalAmount: number;
    if (installments.length > 0) {
      finalAmount = installments.reduce(
        (sum, installment) => sum + installment.amount,
        0
      );
    } else if (subCategories.length > 0) {
      finalAmount = subCategories.reduce((sum, sub) => sum + sub.value, 0);
    } else {
      finalAmount = parseFloat(formData.amount);
    }

    // Montagem do payload interno (mantém compatibilidade com onSubmit atual)
    const transaction = {
      ...(initialData?.id && { id: initialData.id }),
      ...formData,
      amount: finalAmount,
      date: format(date, "yyyy-MM-dd"),
      tags: tags.length > 0 ? tags : undefined,
      subCategories: subCategories.length > 0 ? subCategories : undefined,
      installments: installments.length > 0 ? installments : undefined,
    };

    onSubmit(transaction); // mantém fluxo atual
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Transação" : "Nova Transação"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                onValueChange={(value) => handleInputChange("type", value)}
                value={formData.type}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Descreva a transação"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                onValueChange={(value) => handleInputChange("category", value)}
                value={formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {ref.categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Conta *</Label>
              <Select
                onValueChange={(value) => handleInputChange("account", value)}
                value={formData.account}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.list.data?.map((acc) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "PPP", { locale: ptBR })
                    : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                placeholder="Adicionar tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button
                type="button"
                onClick={handleAddTag}
                size="icon"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Gerenciador de Subcategorias */}
          <SubCategoryManager
            subCategories={subCategories}
            onSubCategoriesChange={setSubCategories}
            totalValue={parseFloat(formData.amount) || 0}
          />

          {/* Gerenciador de Parcelas */}
          <InstallmentManager
            installments={installments}
            onInstallmentsChange={setInstallments}
            totalAmount={parseFloat(formData.amount) || 0}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? "Salvar Alterações" : "Salvar Transação"}
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

export default TransactionForm;
