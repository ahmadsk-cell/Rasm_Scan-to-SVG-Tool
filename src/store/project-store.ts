"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, ProjectStatus } from "@/types";

interface ProjectState {
  projects: Project[];
  statusFilter: ProjectStatus | "all";
  searchQuery: string;
  setStatusFilter: (status: ProjectStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  upsertProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
  filteredProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      statusFilter: "all",
      searchQuery: "",

      setStatusFilter: (status) => set({ statusFilter: status }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      upsertProject: (project) =>
        set((state) => {
          const exists = state.projects.some((item) => item.id === project.id);
          return {
            projects: exists
              ? state.projects.map((item) => (item.id === project.id ? project : item))
              : [project, ...state.projects],
          };
        }),

      getProject: (id) => get().projects.find((project) => project.id === id),

      filteredProjects: () => {
        const { projects, statusFilter, searchQuery } = get();
        return projects.filter((project) => {
          const matchesStatus = statusFilter === "all" || project.status === statusFilter;
          const matchesSearch =
            !searchQuery || project.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesStatus && matchesSearch;
        });
      },
    }),
    {
      name: "rasm-projects",
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);
