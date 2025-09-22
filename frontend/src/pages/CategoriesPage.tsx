import { Layout } from "@/components/Layout";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
interface EditableSub {
  id?: number;
  name: string;
}
interface ApiCategory {
  id: number;
  name: string;
  sub_categories?: Array<{
    id: number;
    name: string;
    category_id: number;
  }>;
}
export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories, refresh, subCategories } = useReferenceData();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [subs, setSubs] = useState<EditableSub[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingCat, setDeletingCat] = useState<ApiCategory | null>(null);
  const reset = () => {
    setEditingId(null);
    setName("");
    setSubs([]);
  };
  const startCreate = () => {
    navigate("/categories/new");
  };
  const startEdit = async (id: number) => {
    try {
      const data = (await api.misc.categories({
        with_subs: true,
      })) as ApiCategory[];
      const cat = data.find((c) => c.id === id);
      if (!cat) return;
      setEditingId(id);
      setName(cat.name);
      setSubs(
        (cat.sub_categories || []).map((s) => ({ id: s.id, name: s.name }))
      );
      setOpen(true);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    }
  };
  const addLocalSub = () => setSubs([...subs, { name: "" }]);
  const updateLocalSub = (idx: number, value: string) =>
    setSubs(subs.map((s, i) => (i === idx ? { ...s, name: value } : s)));
  const removeLocalSub = (idx: number) =>
    setSubs(subs.filter((_, i) => i !== idx));
  const submit = async () => {
    setLoading(true);
    try {
      const payload: {
        name: string;
        sub_categories: EditableSub[];
      } = {
        name,
        sub_categories: subs.filter((s) => s.name.trim() !== ""),
      };
      if (editingId) await api.misc.updateCategory(editingId, payload);
      else await api.misc.createCategory(payload);
      toast.success("Salvo");
      setOpen(false);
      reset();
      await refresh();
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const remove = async (id: number) => {
    try {
      await api.misc.deleteCategory(id);
      toast.success("Excluída");
      await refresh();
    } catch (e) {
      const err = e as Error;
      toast.error(err.message);
    } finally {
      setDeletingCat(null);
    }
  };
  useEffect(() => {
    refresh();
  }, [refresh]);
  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova
        </Button>
      </div>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Filtrar"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {filteredCats.map((cat) => {
          const catSubs = subCategories.filter((s) => s.category_id === cat.id);
          return (
            <Card key={cat.id} className="relative group">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{cat.name}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => startEdit(cat.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setDeletingCat(cat as ApiCategory)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {catSubs.length ? (
                  <ul className="text-sm space-y-1 list-disc ml-4">
                    {catSubs.map((sc) => (
                      <li key={sc.id}>{sc.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem subcategorias
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) reset();
          setOpen(o);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Subcategorias</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={addLocalSub}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {subs.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Nome"
                      value={s.name}
                      onChange={(e) => updateLocalSub(i, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLocalSub(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {!subs.length && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma subcategoria adicionada.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={submit} disabled={loading || !name.trim()}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingCat}
        onOpenChange={(o) => {
          if (!o) setDeletingCat(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{deletingCat?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCat && remove(deletingCat.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
