import { create } from "zustand";

interface StoreState {
  count: number;
  increase: () => void;
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}));
