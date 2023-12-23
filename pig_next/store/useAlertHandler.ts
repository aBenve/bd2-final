import { create } from "zustand";

export interface Alert extends AlertWithOutId {
  id: number;
}

interface AlertWithOutId {
  message: string;
  code?: string;
  isError?: boolean;
}

interface AlertHandlerStore {
  alerts: Alert[];
  setAlert: (alert: AlertWithOutId) => void;
  clearAlerts: () => void;
  removeAlert: (alertId: number) => void;
}

export const useAlertHandler = create<AlertHandlerStore>((set, get) => ({
  alerts: [],
  setAlert: (alert: AlertWithOutId) => {
    const id = get().alerts.length + 1;
    const newAlert: Alert = { ...alert, id };
    if (get().alerts.length >= 3) {
      set({ alerts: [...get().alerts.slice(1), newAlert] });
      return;
    }
    set({ alerts: [...get().alerts, newAlert] });
  },
  clearAlerts: () => {
    set({ alerts: [] });
  },
  removeAlert: (errorId: number) => {
    set({ alerts: get().alerts.filter((e) => e.id !== errorId) });
  },
}));
