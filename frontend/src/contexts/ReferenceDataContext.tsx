import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export interface ReferenceDataContextValue {
  categories: Array<{ id: number; name: string }>;
  subCategories: Array<{ id: number; name: string; category_id: number }>;
  tags: Array<{ id: number; name: string }>;
  refresh: () => Promise<void>;
  loading: boolean;
}

const ReferenceDataContext = createContext<
  ReferenceDataContextValue | undefined
>(undefined);

export const ReferenceDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [categories, setCategories] = useState<
    ReferenceDataContextValue["categories"]
  >([]);
  const [subCategories, setSubCategories] = useState<
    ReferenceDataContextValue["subCategories"]
  >([]);
  const [tags, setTags] = useState<ReferenceDataContextValue["tags"]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, subs] = await Promise.all([
        api.misc.categories({ with_subs: false }),
        api.misc.subCategories(),
      ]);
      console.log("Dados de referência carregados:", {
        categories: cats,
        subCategories: subs,
      });
      setCategories(cats.map((c) => ({ id: c.id, name: c.name })));
      setSubCategories(
        subs.map((s) => ({
          id: s.id,
          name: s.name,
          category_id: s.category_id,
        }))
      );
    } catch (e) {
      // Ignora erros (ex: 401 antes de autenticar). Será re-tentado quando isAuthenticated mudar.
      console.warn("Falha ao carregar dados de referência:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega dados apenas quando autenticado para evitar 401 antes do login
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);

    if (isAuthenticated) {
      loadAll();
    } else {
      // limpa dados ao deslogar
      setCategories([]);
      setSubCategories([]);
      setTags([]);
    }
  }, [isAuthenticated, loadAll]);

  return (
    <ReferenceDataContext.Provider
      value={{ categories, subCategories, tags, refresh: loadAll, loading }}
    >
      {children}
    </ReferenceDataContext.Provider>
  );
};

export function useReferenceData() {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx)
    throw new Error(
      "useReferenceData must be used within ReferenceDataProvider"
    );
  return ctx;
}
