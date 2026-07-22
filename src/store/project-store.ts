"use client";

import { create } from "zustand";
import { DEMO_FOLDERS, DEMO_PROJECTS } from "@/lib/mock-data";
import type { Folder, Project, ProjectStatus } from "@/types";

interface ProjectState {
  projects: Project[];
  folders: Folder[];
  statusFilter: ProjectStatus | "all";
  searchQuery: string;
  selectedFolderId: string | null;
  setStatusFilter: (status: ProjectStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolderId: (id: string | null) => void;
  upsertProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
  filteredProjects: () => Project[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: DEMO_PROJECTS,
  folders: DEMO_FOLDERS,
  statusFilter: "all",
  searchQuery: "",
  selectedFolderId: null,

  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),

  upsertProject: (project) =>
    set((state) => {
      const exists = state.projects.some((p) => p.id === project.id);
      return {
        projects: exists
          ? state.projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...state.projects],
      };
    }),

  getProject: (id) => get().projects.find((p) => p.id === id),

  filteredProjects: () => {
    const { projects, statusFilter, searchQuery, selectedFolderId } = get();
    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesFolder =
        !selectedFolderId || project.folderId === selectedFolderId;
      const matchesSearch =
        !searchQuery ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesFolder && matchesSearch;
    });
  },
}));
