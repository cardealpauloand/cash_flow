import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Calculator } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export interface SubCategory {
  id: string;
  value: number;
  category: string;
  subCategory: string;
}

interface SubCategoryManagerProps {
  subCategories: SubCategory[];
  onSubCategoriesChange: (subCategories: SubCategory[]) => void;
  totalValue: number;
}

const SubCategoryManager = ({ subCategories, onSubCategoriesChange, totalValue }: SubCategoryManagerProps) => {
  const { formatCurrency } = useApp();
  const [newSubCategory, setNewSubCategory] = useState({
    value: "",
    category: "",
    subCategory: ""
  });

  const categories = [
    "Lazer",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Casa",
    "Trabalho",
    "Suplementação",
    "Outros"
  ];

  const subCategoryOptions: Record<string, string[]> = {
    "Lazer": ["Cinema", "Restaurante", "Jogos", "Viagem", "Comida", "Bebidas"],
    "Alimentação": ["Supermercado", "Delivery", "Lanche", "Café", "Mercado"],
    "Transporte": ["Gasolina", "Uber", "Ônibus", "Taxi", "Estacionamento"],
    "Saúde": ["Farmácia", "Médico", "Exames", "Dentista", "Academia"],
    "Educação": ["Cursos", "Livros", "Material", "Mensalidade"],
    "Casa": ["Aluguel", "Condomínio", "Luz", "Água", "Internet", "Limpeza"],
    "Trabalho": ["Material", "Transporte", "Almoço", "Café"],
    "Suplementação": ["Whey", "Creatina", "Vitaminas", "BCAA", "Glutamina"],
    "Outros": ["Diversos", "Emergência", "Presente"]
  };

  const handleAddSubCategory = () => {
    if (newSubCategory.value && newSubCategory.category && newSubCategory.subCategory) {
      const subCategory: SubCategory = {
        id: Date.now().toString(),
        value: parseFloat(newSubCategory.value),
        category: newSubCategory.category,
        subCategory: newSubCategory.subCategory
      };
      
      onSubCategoriesChange([...subCategories, subCategory]);
      setNewSubCategory({ value: "", category: "", subCategory: "" });
    }
  };

  const handleRemoveSubCategory = (id: string) => {
    onSubCategoriesChange(subCategories.filter(sub => sub.id !== id));
  };

  const calculatedTotal = subCategories.reduce((sum, sub) => sum + sub.value, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Subcategorias
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
              onChange={(e) => setNewSubCategory(prev => ({ ...prev, value: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              onValueChange={(value) => {
                setNewSubCategory(prev => ({ ...prev, category: value, subCategory: "" }));
              }} 
              value={newSubCategory.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subCategory">Subcategoria</Label>
            <Select 
              onValueChange={(value) => setNewSubCategory(prev => ({ ...prev, subCategory: value }))} 
              value={newSubCategory.subCategory}
              disabled={!newSubCategory.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {newSubCategory.category && subCategoryOptions[newSubCategory.category]?.map((subCat) => (
                  <SelectItem key={subCat} value={subCat}>{subCat}</SelectItem>
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
              disabled={!newSubCategory.value || !newSubCategory.category || !newSubCategory.subCategory}
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
                <Badge key={sub.id} variant="secondary" className="flex items-center gap-2 p-2">
                  <span className="font-medium">{formatCurrency(sub.value)}</span>
                  <span className="text-xs">
                    {sub.category} → {sub.subCategory}
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
              <span className="font-bold text-lg">{formatCurrency(calculatedTotal)}</span>
            </div>

            {/* Alerta se valores não batem */}
            {totalValue > 0 && Math.abs(calculatedTotal - totalValue) > 0.01 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ O valor total ({formatCurrency(totalValue)}) não corresponde à soma das subcategorias ({formatCurrency(calculatedTotal)})
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