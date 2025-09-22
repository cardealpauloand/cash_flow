import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
export default function CategoryCreatePage() {
  const navigate = useNavigate();
  const { refresh } = useReferenceData();
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const canSave =
    categoryName.trim().length > 0 && subCategoryName.trim().length > 0;
  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await api.misc.createCategory({
        name: categoryName.trim(),
        sub_categories: [{ name: subCategoryName.trim() }],
      });
      toast.success("Categoria e subcategoria cadastradas");
      await refresh();
      navigate("/categories");
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Nova Categoria e Subcategoria
            </h1>
            <p className="text-sm text-muted-foreground">
              Cadastre uma nova categoria com sua subcategoria vinculada.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nome da categoria
              </label>
              <Input
                placeholder="Ex.: Alimentação"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nome da subcategoria
              </label>
              <Input
                placeholder="Ex.: Supermercado"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                A subcategoria será vinculada automaticamente à categoria
                criada.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate("/categories")}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!canSave || saving}>
                <Plus className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
