// frontend/src/hooks/useNotification.ts
import { useState, useEffect } from "react";
import { api } from "../services/api";

type NotificationStatus = {
  email: boolean;
  whatsapp: boolean;
};

export function useNotificationStatus() {
  const [status, setStatus] = useState<NotificationStatus | null>(null);

  useEffect(() => {
    api
      .get<NotificationStatus>("/notifications/status")
      .then((res) => setStatus(res.data))
      .catch(() => setStatus({ email: false, whatsapp: false }));
  }, []);

  return status;
}

export async function sendTaskNotification(taskId: number): Promise<boolean> {
  try {
    await api.post("/notifications/send", { taskId });
    return true;
  } catch {
    return false;
  }
}
