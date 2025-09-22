import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
export interface ReferenceDataContextValue {
  categories: Array<{
    id: number;
    name: string;
  }>;
  subCategories: Array<{
    id: number;
    name: string;
    category_id?: number | null;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
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
        api.misc.categories(),
        api.misc.subCategories(),
      ]);
      console.log("Dados de referência carregados:", {
        categories: cats,
        subCategories: subs,
      });
      setCategories(cats);
      setSubCategories(subs);
    } catch (e) {
      console.warn("Falha ao carregar dados de referência:", e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    console.log("isAuthenticated", isAuthenticated);
    if (isAuthenticated) {
      loadAll();
    } else {
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
