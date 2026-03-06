import { api } from "../services/api";
import type { Tech } from "../types/Tech";

export async function getTechs(): Promise<Tech[]> {
  const response = await api.get("/api/techs");
  return response.data;
}
