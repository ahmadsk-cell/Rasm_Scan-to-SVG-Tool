export type ProjectStatus = "processing" | "completed" | "failed" | "draft";

export type AnalysisMode = "geometry" | "detail";

export type ExportFormat = "svg" | "dxf" | "json" | "ai";

export interface VectorLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  pathData: string;
  color: string;
  group?: string;
}

export interface VectorTuning {
  curveSmoothing: number;
  noiseReduction: number;
  pathSimplification: number;
}

export interface ProcessingMilestone {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  folderId: string | null;
  thumbnailUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  views: string[];
  layers: VectorLayer[];
  analysisModes: AnalysisMode[];
  tuning: VectorTuning;
  svgPreview?: string;
}

export interface Folder {
  id: string;
  name: string;
  projectCount: number;
}

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  label: string;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organization: string;
  role: "admin" | "editor" | "viewer";
}
