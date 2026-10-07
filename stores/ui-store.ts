import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activeTab: string;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setActiveTab: (tab: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  activeTab: "feed",

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
