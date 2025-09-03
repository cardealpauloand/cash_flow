import { useState, Fragment } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Calculator } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";

export interface SubCategory {
  id: string; // internal UI id
  value: number;
  categoryId?: number; // id real da categoria
  subCategoryId?: number; // id real da subcategoria
}

interface SubCategoryManagerProps {
  subCategories: SubCategory[];
  onSubCategoriesChange: (subCategories: SubCategory[]) => void;
  totalValue: number;
}

const SubCategoryManager = ({
  subCategories,
  onSubCategoriesChange,
  totalValue,
}: SubCategoryManagerProps) => {
  const { formatCurrency } = useApp();
  const ref = useReferenceData();
  const [newSubCategory, setNewSubCategory] = useState<{
    value: string;
    selection?: string; // formato: "c:<catId>" ou "s:<catId>:<subId>"
  }>({ value: "" });

  const handleAddSubCategory = () => {
    if (!newSubCategory.value) return;
    let categoryId: number | undefined = undefined;
    let subCategoryId: number | undefined = undefined;
    if (newSubCategory.selection) {
      const sel = newSubCategory.selection;
      if (sel.startsWith("c:")) {
        const cId = Number(sel.split(":")[1]);
        if (!Number.isNaN(cId)) categoryId = cId;
      } else if (sel.startsWith("s:")) {
        const parts = sel.split(":");
        const cId = Number(parts[1]);
        const sId = Number(parts[2]);
        if (!Number.isNaN(cId)) categoryId = cId;
        if (!Number.isNaN(sId)) subCategoryId = sId;
      }
    }
    const sub: SubCategory = {
      id: Date.now().toString(),
      value: parseFloat(newSubCategory.value),
      categoryId,
      subCategoryId,
    };
    onSubCategoriesChange([...subCategories, sub]);
    setNewSubCategory({ value: "" });
  };

  const handleRemoveSubCategory = (id: string) => {
    onSubCategoriesChange(subCategories.filter((sub) => sub.id !== id));
  };

  const calculatedTotal = subCategories.reduce(
    (sum, sub) => sum + sub.value,
    0
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Rateio por categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário para adicionar subcategoria */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label htmlFor="subValue">Valor</Label>
            <Input
              id="subValue"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={newSubCategory.value}
              onChange={(e) =>
                setNewSubCategory((prev) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              onValueChange={(value) =>
                setNewSubCategory((prev) => ({
                  ...prev,
                  selection: value || undefined,
                }))
              }
              value={newSubCategory.selection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione categoria ou subcategoria" />
              </SelectTrigger>
              <SelectContent>
                {ref.categories.map((cat) => (
                  <Fragment key={`grp-${cat.id}`}>
                    <SelectItem key={`c-${cat.id}`} value={`c:${cat.id}`}>
                      {cat.name}
                    </SelectItem>
                    {ref.subCategories
                      .filter((s) => s.category_id === cat.id)
                      .map((sc) => (
                        <SelectItem
                          key={`s-${cat.id}-${sc.id}`}
                          value={`s:${cat.id}:${sc.id}`}
                        >
                          {cat.name} → {sc.name}
                        </SelectItem>
                      ))}
                  </Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              type="button"
              onClick={handleAddSubCategory}
              className="w-full"
              disabled={!newSubCategory.value}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Lista de subcategorias */}
        {subCategories.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {subCategories.map((sub) => (
                <Badge
                  key={sub.id}
                  variant="secondary"
                  className="flex items-center gap-2 p-2"
                >
                  <span className="font-medium">
                    {formatCurrency(sub.value)}
                  </span>
                  <span className="text-xs">
                    {ref.categories.find((c) => c.id === sub.categoryId)
                      ?.name || "—"}{" "}
                    →{" "}
                    {ref.subCategories.find((s) => s.id === sub.subCategoryId)
                      ?.name || "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubCategory(sub.id)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Total calculado */}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Total Calculado:</span>
              <span className="font-bold text-lg">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>

            {/* Alerta se valores não batem */}
            {totalValue > 0 &&
              Math.abs(calculatedTotal - totalValue) > 0.01 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ O valor total ({formatCurrency(totalValue)}) não
                    corresponde à soma das subcategorias (
                    {formatCurrency(calculatedTotal)})
                  </p>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubCategoryManager;
