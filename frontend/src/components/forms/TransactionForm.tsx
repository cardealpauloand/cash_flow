import { useEffect, useState, useRef, useCallback } from "react";
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
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useAccounts } from "@/hooks/useAccounts";
import { Form } from "@unform/web";
import { FormHandles, useField } from "@unform/core";
import UnformInput from "./unform/UnformInput";
import UnformSelect from "./unform/UnformSelect";

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
  installments_count?: number;
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
  // Remover formData consolidado e usar Unform
  const formRef = useRef<FormHandles>(null);
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>(
    initialData?.subCategories || []
  );
  const [installmentsEnabled, setInstallmentsEnabled] =
    useState<boolean>(false);
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);

  const ref = useReferenceData();
  const accounts = useAccounts();

  useEffect(() => {
    if (initialData) {
      formRef.current?.setData({
        type: initialData.type || "",
        description: initialData.description || "",
        amount: initialData.amount?.toString() || "",
        category: initialData.category || "",
        account: initialData.account || "",
      });
    }
  }, [initialData]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) =>
    setTags(tags.filter((t) => t !== tagToRemove));

  const internalSubmit = useCallback(
    (data: {
      type: string;
      description: string;
      amount: string;
      category?: string;
      account: string;
    }) => {
      let finalAmount: number;
      if (subCategories.length > 0) {
        finalAmount = subCategories.reduce((sum, s) => sum + s.value, 0);
      } else {
        finalAmount = parseFloat(data.amount);
      }

      const payload: TransactionFormSubmitPayload = {
        ...(initialData?.id && { id: initialData.id }),
        type: data.type,
        description: data.description,
        amount: finalAmount,
        category: data.category || undefined,
        account: data.account,
        date: format(date, "yyyy-MM-dd"),
        tags: tags.length ? tags : undefined,
        subCategories: subCategories.length ? subCategories : undefined,
        installments_count:
          installmentsEnabled && installmentsCount > 1
            ? installmentsCount
            : undefined,
      };
      onSubmit(payload);
    },
    [
      subCategories,
      date,
      tags,
      onSubmit,
      initialData?.id,
      installmentsEnabled,
      installmentsCount,
    ]
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Transação" : "Nova Transação"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          ref={formRef}
          onSubmit={internalSubmit}
          className="space-y-4"
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          placeholder=""
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UnformSelect
              name="type"
              label="Tipo"
              required
              placeholder="Selecione o tipo"
            >
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="transfer">Transferência</SelectItem>
            </UnformSelect>
            <UnformInput
              name="amount"
              label="Valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>

          <UnformInput
            name="description"
            label="Descrição"
            placeholder="Descreva a transação"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UnformSelect
              name="category"
              label="Categoria"
              placeholder="Selecione a categoria"
            >
              {ref.categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </UnformSelect>
            <UnformSelect
              name="account"
              label="Conta"
              required
              placeholder="Selecione a conta"
            >
              {accounts.list.data?.map((acc) => (
                <SelectItem key={acc.id} value={String(acc.id)}>
                  {acc.name}
                </SelectItem>
              ))}
            </UnformSelect>
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
                  onSelect={(d) => d && setDate(d)}
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

          <SubCategoryManager
            subCategories={subCategories}
            onSubCategoriesChange={setSubCategories}
            totalValue={
              parseFloat(
                (formRef.current?.getFieldValue("amount") as string) || "0"
              ) || 0
            }
          />

          <div className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <input
                id="enableInstallments"
                type="checkbox"
                className="h-4 w-4"
                checked={installmentsEnabled}
                onChange={(e) => setInstallmentsEnabled(e.target.checked)}
                disabled={
                  (formRef.current?.getFieldValue("type") as string) ===
                  "transfer"
                }
              />
              <Label htmlFor="enableInstallments" className="cursor-pointer">
                Parcelar (backend divide valor igualmente)
              </Label>
            </div>
            {installmentsEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="installmentsCount">Nº Parcelas</Label>
                  <Input
                    id="installmentsCount"
                    type="number"
                    min={2}
                    max={60}
                    value={installmentsCount}
                    onChange={(e) =>
                      setInstallmentsCount(
                        Math.max(2, parseInt(e.target.value) || 2)
                      )
                    }
                  />
                </div>
                <div className="sm:col-span-2 text-sm text-muted-foreground flex items-end">
                  O backend criará {installmentsCount} parcelas. A última pode
                  ajustar centavos.
                </div>
              </div>
            )}
          </div>

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
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
