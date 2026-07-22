"use client";

import { create } from "zustand";
import type {
  AnalysisMode,
  ProcessingMilestone,
  UploadedImage,
  VectorLayer,
  VectorTuning,
} from "@/types";
import { PROCESSING_STEPS } from "@/lib/vector-engine";

interface StudioState {
  images: UploadedImage[];
  modes: AnalysisMode[];
  isProcessing: boolean;
  progress: number;
  milestones: ProcessingMilestone[];
  layers: VectorLayer[];
  tuning: VectorTuning;
  comparePosition: number;
  activeProjectId: string | null;
  selectedLayerId: string | null;
  addImages: (images: UploadedImage[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  toggleMode: (mode: AnalysisMode) => void;
  setProcessing: (value: boolean) => void;
  setProgress: (value: number) => void;
  setMilestones: (milestones: ProcessingMilestone[]) => void;
  resetMilestones: () => void;
  setLayers: (layers: VectorLayer[]) => void;
  updateLayer: (id: string, patch: Partial<VectorLayer>) => void;
  setTuning: (tuning: Partial<VectorTuning>) => void;
  setComparePosition: (value: number) => void;
  setActiveProjectId: (id: string | null) => void;
  setSelectedLayerId: (id: string | null) => void;
}

const initialMilestones: ProcessingMilestone[] = PROCESSING_STEPS.map((step) => ({
  ...step,
  status: "pending",
}));

export const useStudioStore = create<StudioState>((set) => ({
  images: [],
  modes: ["geometry"],
  isProcessing: false,
  progress: 0,
  milestones: initialMilestones,
  layers: [],
  tuning: {
    curveSmoothing: 45,
    noiseReduction: 30,
    pathSimplification: 20,
  },
  comparePosition: 50,
  activeProjectId: null,
  selectedLayerId: null,

  addImages: (images) =>
    set((state) => ({ images: [...state.images, ...images] })),

  removeImage: (id) =>
    set((state) => ({ images: state.images.filter((img) => img.id !== id) })),

  clearImages: () => set({ images: [] }),

  toggleMode: (mode) =>
    set((state) => {
      const has = state.modes.includes(mode);
      if (has && state.modes.length === 1) return state;
      return {
        modes: has
          ? state.modes.filter((m) => m !== mode)
          : [...state.modes, mode],
      };
    }),

  setProcessing: (value) => set({ isProcessing: value }),
  setProgress: (value) => set({ progress: value }),
  setMilestones: (milestones) => set({ milestones }),
  resetMilestones: () => set({ milestones: initialMilestones, progress: 0 }),
  setLayers: (layers) => set({ layers, selectedLayerId: layers[0]?.id ?? null }),
  updateLayer: (id, patch) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...patch } : layer
      ),
    })),
  setTuning: (tuning) =>
    set((state) => ({ tuning: { ...state.tuning, ...tuning } })),
  setComparePosition: (value) => set({ comparePosition: value }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
}));
