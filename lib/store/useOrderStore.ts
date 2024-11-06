import { create } from "zustand";

interface OrderData {
  id: number;
  Status: string;
  Nume_Prenume: string;
  Numar_telefon: string;
  Pret_Livrare: string;
  Cantitate: number;
  Produs_Id: number;
  Nume_Produs: string;
  Pret_Standard: string;
  Pret_Redus: string | null;
  Imagine_Principala: string;
}

interface OrderStore {
  orderData: OrderData | null;
  setOrderData: (data: OrderData) => void;
  clearOrderData: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orderData: null,
  setOrderData: (data) => set({ orderData: data }),
  clearOrderData: () => set({ orderData: null }),
}));
