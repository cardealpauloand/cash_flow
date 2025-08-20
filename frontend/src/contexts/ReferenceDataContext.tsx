import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

export interface ReferenceDataContextValue {
  categories: Array<{ id: number; name: string }>;
  subCategories: Array<{ id: number; name: string }>;
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

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cats, subs, tgs] = await Promise.all([
        api.misc.categories(),
        api.misc.subCategories(),
        api.misc.tags(),
      ]);
      setCategories(cats);
      setSubCategories(subs);
      setTags(tgs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

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
