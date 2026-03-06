import { useEffect, useState } from "react";
import { getTechs } from "../services/techs.service";
import type { Tech } from "../types/Tech";

export function useTechsInfo() {
  const [techs, setTechs] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTechs() {
      try {
        const data = await getTechs();
        setTechs(data);
      } catch (error) {
        console.error("Erro ao buscar tecnologias", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTechs();
  }, []);

  return { techs, loading };
}