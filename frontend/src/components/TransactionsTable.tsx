import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstallmentListItem } from "@/lib/api";
import { useMemo } from "react";
function mapType(id: number): "income" | "expense" | "transfer" {
  if (id === 1) return "income";
  if (id === 2) return "expense";
  return "transfer";
}
const transactionIcons = {
  income: { icon: ArrowUpRight, color: "text-income" },
  expense: { icon: ArrowDownLeft, color: "text-expense" },
  transfer: { icon: ArrowLeftRight, color: "text-transfer" },
};
const transactionLabels = {
  income: "income",
  expense: "expense",
  transfer: "transfer",
} as const;
interface TransactionsTableProps {
  installments: InstallmentListItem[];
  accounts: {
    id: number;
    name: string;
  }[];
  formatCurrency: (value: number) => string;
  t: (key: string) => string;
  formatDate: (date: string) => string;
  onEdit: (inst: InstallmentListItem) => void;
  onDelete: (inst: InstallmentListItem) => void;
}
export const TransactionsTable = ({
  installments,
  accounts,
  formatCurrency,
  t,
  formatDate,
  onEdit,
  onDelete,
}: TransactionsTableProps) => {
  const displayInstallments = useMemo(() => {
    const result: InstallmentListItem[] = [];
    const seenTransferTx = new Set<number>();
    for (const inst of installments) {
      const rootType = mapType(inst.root_transaction_type_id);
      if (rootType === "transfer") {
        if (seenTransferTx.has(inst.transaction_id)) continue;
        const pair = installments.find(
          (i) =>
            i.transaction_id === inst.transaction_id &&
            mapType(i.transaction_type_id) === "income"
        );
        const chosen = pair || inst;
        result.push(chosen);
        seenTransferTx.add(inst.transaction_id);
      } else {
        result.push(inst);
      }
    }
    return result;
  }, [installments]);
  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>{displayInstallments.length} parcelas encontradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInstallments.map((inst) => {
            const isRootTransfer =
              mapType(inst.root_transaction_type_id) === "transfer";
            const logicalType = isRootTransfer
              ? ("transfer" as const)
              : mapType(inst.transaction_type_id);
            const { icon: Icon, color } = transactionIcons[logicalType];
            return (
              <div
                key={inst.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 animate-fade-in group"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "p-3 rounded-full bg-background shadow-card hover:shadow-hover transition-all duration-200",
                      color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {inst.notes && inst.notes.trim().length > 0
                        ? inst.notes
                        : `Movimentação #${inst.id}`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {logicalType === "transfer" ? (
                        <span>
                          {`${
                            accounts.find(
                              (a) => a.id === (inst.account_out_id ?? -1)
                            )?.name || "Conta origem"
                          } -> ${
                            accounts.find(
                              (a) => a.id === (inst.root_account_id ?? -1)
                            )?.name || "Conta destino"
                          }`}
                        </span>
                      ) : (
                        <span>
                          {accounts.find((a) => a.id === inst.account_id)
                            ?.name || "Conta"}
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatDate(inst.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold text-xl",
                        logicalType === "income"
                          ? "text-income"
                          : logicalType === "expense"
                          ? "text-expense"
                          : "text-transfer"
                      )}
                    >
                      {logicalType === "income"
                        ? "+"
                        : logicalType === "expense"
                        ? "-"
                        : ""}
                      {formatCurrency(inst.value)}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {t(transactionLabels[logicalType])}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onEdit(inst)}
                        className="cursor-pointer hover:bg-primary/10"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(inst)}
                        className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
export default TransactionsTable;
