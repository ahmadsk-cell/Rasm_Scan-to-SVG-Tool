"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceUser } from "@/types";

interface AuthState {
  user: WorkspaceUser | null;
  isAuthenticated: boolean;
  signIn: (email?: string) => void;
  signOut: () => void;
}

const DEMO_USER: WorkspaceUser = {
  id: "user-1",
  name: "Ava Chen",
  email: "ava@acme-footwear.com",
  organization: "Acme Footwear Lab",
  role: "admin",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      signIn: (email) =>
        set({
          user: {
            ...DEMO_USER,
            email: email?.trim() || DEMO_USER.email,
          },
          isAuthenticated: true,
        }),
      signOut: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "vectorpath-auth" }
  )
);
