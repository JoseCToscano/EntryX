import { create } from "zustand";

type FrighterStore = {
  publicKey?: string;
  hasFreighter?: boolean;
  setHasFreighter: (hasFreighter: boolean) => void;
  setPublicKey: (publicKey: string) => void;
};

const useFreighter = create<FrighterStore>()((set) => {
  return {
    hasFreighter: false,
    setHasFreighter: (hasFreighter: boolean) => set({ hasFreighter }),
    publicKey: undefined,
    setPublicKey: (publicKey: string) => set({ publicKey }),
  };
});

export default useFreighter;
