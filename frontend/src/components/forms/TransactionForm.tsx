import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  Fragment,
} from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import { api, DashboardSummary } from "@/lib/api";
export interface TransactionFormSubmitPayload {
  id?: string;
  type: string;
  description: string;
  amount: number;
  category?: string;
  account: string;
  account_out_id?: string;
  date: string;
  tags?: string[];
  subCategories?: SubCategory[];
  installments_count?: number;
}
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
  forcedType?: "income" | "expense" | "transfer";
  titleOverride?: string;
  hasTitle?: boolean;
}
const TransactionForm = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  forcedType,
  titleOverride,
  hasTitle = false,
}: TransactionFormProps) => {
  const formRef = useRef<FormHandles>(null);
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [subCategories, setSubCategories] = useState<SubCategory[]>(
    initialData?.subCategories || []
  );

  const ref = useReferenceData();
  const accounts = useAccounts();
  const { data: dashboard } = useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.dashboard.summary(),
    staleTime: 30000,
  });
  const [formError, setFormError] = useState<string>("");
  const [isTransfer, setIsTransfer] = useState<boolean>(
    forcedType === "transfer"
  );
  useEffect(() => {
    if (initialData) {
      formRef.current?.setData({
        type: initialData.type || forcedType || "",
        description: initialData.description || "",
        amount: initialData.amount?.toString() || "",
        category: initialData.category || "",
        account: initialData.account || "",
        account_out_id: initialData.account_out_id || "",
      });
      setIsTransfer((forcedType || initialData.type) === "transfer");
    }
  }, [initialData, forcedType]);

  const getFormTitle = useMemo(() => {
    if (titleOverride) return titleOverride;

    const currentType = forcedType || initialData?.type || "transaction";

    if (isEditing) {
      switch (currentType) {
        case "income":
          return "Editar Receita";
        case "expense":
          return "Editar Despesa";
        case "transfer":
          return "Editar Transferência";
        default:
          return "Editar Transação";
      }
    } else {
      switch (currentType) {
        case "income":
          return "Nova Receita";
        case "expense":
          return "Nova Despesa";
        case "transfer":
          return "Nova Transferência";
        default:
          return "Nova Transação";
      }
    }
  }, [titleOverride, isEditing, forcedType, initialData?.type]);

  const internalSubmit = useCallback(
    (data: {
      type: string;
      description: string;
      amount: string;
      category?: string;
      account: string;
      account_out_id?: string;
    }) => {
      formRef.current?.setErrors({});
      setFormError("");
      const typeToUse = isTransfer
        ? "transfer"
        : ((forcedType || data.type || initialData?.type) as
            | "income"
            | "expense"
            | "transfer");
      const errors: Record<string, string> = {};
      const normalizedAccount = data.account?.toString().trim();
      const normalizedOriginAccount = data.account_out_id?.toString().trim();
      const normalizedDescription = data.description?.trim();

      if (
        !data.amount ||
        isNaN(parseFloat(data.amount)) ||
        parseFloat(data.amount) <= 0
      ) {
        errors.amount = "Informe um valor válido.";
      }

      if (!normalizedAccount) {
        errors.account =
          typeToUse === "transfer"
            ? "Selecione a conta de destino."
            : "Selecione a conta.";
      }

      if (typeToUse === "transfer" && !normalizedOriginAccount) {
        errors.account_out_id = "Selecione a conta de origem.";
      }

      if (Object.keys(errors).length) {
        Object.entries(errors).forEach(([field, message]) => {
          console.warn(`Campo obrigatório ausente: ${field} -> ${message}`);
        });
        formRef.current?.setErrors(errors);
        return;
      }

      let finalAmount: number = parseFloat(data.amount);
      if (!isEditing && typeToUse !== "transfer" && subCategories.length > 0) {
        finalAmount = subCategories.reduce((sum, s) => sum + s.value, 0);
      }
      if (!isFinite(finalAmount) || finalAmount <= 0) {
        formRef.current?.setErrors({ amount: "Informe um valor válido." });
        return;
      }
      if (typeToUse === "transfer") {
        const originId = Number(data.account_out_id);
        const originBalance =
          dashboard?.accounts?.find((a) => a.id === originId)?.balance ?? 0;
        if (finalAmount > originBalance) {
          setFormError(
            `Saldo insuficiente na conta de origem. Disponível: ${originBalance.toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            )}`
          );
          return;
        }
      }
      const payload: TransactionFormSubmitPayload = {
        ...(initialData?.id && { id: initialData.id }),
        type: typeToUse,
        description: normalizedDescription ?? initialData?.description ?? "",
        amount: finalAmount,
        category: data.category || undefined,
        account: normalizedAccount || data.account,
        account_out_id: normalizedOriginAccount,
        date: format(date, "yyyy-MM-dd"),
        subCategories: subCategories.length ? subCategories : undefined,
      };
      onSubmit(payload);
    },
    [
      subCategories,
      date,
      onSubmit,
      initialData?.id,
      initialData?.description,
      initialData?.type,
      dashboard,
      forcedType,
      isEditing,
      isTransfer,
    ]
  );
  return (
    <Card className="shadow-card">
      {hasTitle && (
        <CardHeader>
          <CardTitle>{getFormTitle}</CardTitle>
        </CardHeader>
      )}

      <CardContent className="mt-5">
        <Form
          ref={formRef}
          onSubmit={internalSubmit}
          className="space-y-4"
          onPointerEnterCapture={() => {}}
          onPointerLeaveCapture={() => {}}
          placeholder=""
        >
          {(() => {
            const showOnlyFour =
              isTransfer && (isEditing || forcedType === "transfer");
            if (showOnlyFour) {
              return (
                <div className="space-y-4">
                  <UnformInput
                    name="amount"
                    label="Valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                  />

                  <UnformSelect
                    name="category"
                    label="Categoria"
                    placeholder="Selecione a categoria ou subcategoria"
                  >
                    {ref.categories.map((c) => (
                      <Fragment key={`grp-${c.id}`}>
                        <SelectItem key={`c-${c.id}`} value={`c:${c.id}`}>
                          {c.name}
                        </SelectItem>
                        {ref.subCategories
                          .filter((s) => s.category_id === c.id)
                          .map((s) => (
                            <SelectItem
                              key={`s-${c.id}-${s.id}`}
                              value={`s:${c.id}:${s.id}`}
                            >
                              {c.name} → {s.name}
                            </SelectItem>
                          ))}
                      </Fragment>
                    ))}
                  </UnformSelect>
                  <UnformSelect
                    name="account_out_id"
                    label="Conta de origem"
                    placeholder="Selecione a conta de origem"
                    defaultValue={initialData?.account_out_id}
                  >
                    {accounts.list.data?.map((acc) => (
                      <SelectItem key={acc.id} value={String(acc.id)}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </UnformSelect>
                  <UnformSelect
                    name="account"
                    label="Conta de destino"
                    placeholder="Selecione a conta de destino"
                    defaultValue={initialData?.account}
                  >
                    {accounts.list.data?.map((acc) => (
                      <SelectItem key={acc.id} value={String(acc.id)}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </UnformSelect>
                  {formError && (
                    <div className="text-sm text-destructive">{formError}</div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {!isTransfer && (
            <>
              {forcedType ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UnformInput
                    name="amount"
                    label="Valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <UnformInput
                    name="amount"
                    label="Valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UnformSelect
                  name="category"
                  label="Categoria"
                  placeholder="Selecione a categoria ou subcategoria"
                >
                  {ref.categories.map((c) => (
                    <Fragment key={`grp-${c.id}`}>
                      <SelectItem key={`c-${c.id}`} value={`c:${c.id}`}>
                        {c.name}
                      </SelectItem>
                      {ref.subCategories
                        .filter((s) => s.category_id === c.id)
                        .map((s) => (
                          <SelectItem
                            key={`s-${c.id}-${s.id}`}
                            value={`s:${c.id}:${s.id}`}
                          >
                            {c.name} → {s.name}
                          </SelectItem>
                        ))}
                    </Fragment>
                  ))}
                </UnformSelect>
                <UnformSelect
                  name="account"
                  label={isTransfer ? "Conta (destino)" : "Conta"}
                  placeholder={
                    isTransfer
                      ? "Selecione a conta de destino"
                      : "Selecione a conta"
                  }
                  defaultValue={initialData?.account}
                >
                  {accounts.list.data?.map((acc) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </UnformSelect>
                {isTransfer && (
                  <UnformSelect
                    name="account_out_id"
                    label="Conta de origem"
                    placeholder="Selecione a conta de origem"
                    defaultValue={initialData?.account_out_id}
                  >
                    {accounts.list.data?.map((acc) => (
                      <SelectItem key={acc.id} value={String(acc.id)}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </UnformSelect>
                )}
              </div>

              {isTransfer && (
                <div className="text-xs text-muted-foreground">
                  {(() => {
                    const oid = Number(
                      (formRef.current?.getFieldValue(
                        "account_out_id"
                      ) as string) || ""
                    );
                    const bal = dashboard?.accounts?.find(
                      (a) => a.id === oid
                    )?.balance;
                    return bal !== undefined
                      ? `Saldo na origem: ${bal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}`
                      : null;
                  })()}
                </div>
              )}

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

              <UnformInput
                name="description"
                label="Descrição"
                placeholder="Descreva a transação"
              />

              <SubCategoryManager
                subCategories={subCategories}
                onSubCategoriesChange={setSubCategories}
                totalValue={
                  parseFloat(
                    (formRef.current?.getFieldValue("amount") as string) || "0"
                  ) || 0
                }
              />
            </>
          )}

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
