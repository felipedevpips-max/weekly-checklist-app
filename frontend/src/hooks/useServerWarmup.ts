import { useEffect, useState } from "react";
import { api } from "../services/api";

type WarmupStatus = "checking" | "ready" | "slow";

export function useServerWarmup() {
  const [status, setStatus] = useState<WarmupStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      // Se responder em menos de 2s, consideramos "ready" direto
      const quickTimeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("slow")), 2000)
      );

      try {
        await Promise.race([api.get("/health"), quickTimeout]);
        if (!cancelled) setStatus("ready");
      } catch {
        // Demorou mais de 2s — avisa o usuário mas continua tentando
        if (!cancelled) setStatus("slow");

        try {
          await api.get("/health");
          if (!cancelled) setStatus("ready");
        } catch {
          // Mesmo com erro, libera a UI — o próprio hook de dados vai tratar
          if (!cancelled) setStatus("ready");
        }
      }
    }

    ping();
    return () => { cancelled = true; };
  }, []);

  return status;
}
