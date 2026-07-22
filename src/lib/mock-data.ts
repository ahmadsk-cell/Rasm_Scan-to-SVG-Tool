import type { Folder, Project } from "@/types";

export const DEMO_FOLDERS: Folder[] = [
  { id: "folder-recent", name: "Recent", projectCount: 3 },
  { id: "folder-logos", name: "Logos & marks", projectCount: 2 },
  { id: "folder-archive", name: "Archive", projectCount: 1 },
];

const defaultTuning = {
  curveSmoothing: 45,
  noiseReduction: 30,
  pathSimplification: 20,
};

export const DEMO_PROJECTS: Project[] = [
  {
    id: "proj-logo-mark",
    name: "Brand mark — flat scan",
    status: "completed",
    folderId: "folder-logos",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    views: ["front"],
    analysisModes: ["geometry", "detail"],
    tuning: defaultTuning,
    layers: [
      {
        id: "l1",
        name: "Outer_Silhouette",
        visible: true,
        locked: false,
        pathData:
          "M40,180 C80,220 220,240 360,200 C400,180 420,120 380,80 C320,20 180,30 100,70 C40,100 20,150 40,180 Z",
        color: "#8fae8b",
        group: "Silhouette",
      },
      {
        id: "l2",
        name: "Inner_Shape",
        visible: true,
        locked: false,
        pathData:
          "M70,150 C120,90 240,70 340,110 C360,130 350,170 300,180 C220,200 120,190 70,150 Z",
        color: "#7a92a8",
        group: "Silhouette",
      },
      {
        id: "l3",
        name: "Accent_Detail",
        visible: true,
        locked: false,
        pathData: "M120,140 C160,120 220,115 280,130 C250,145 190,155 140,150 Z",
        color: "#b8a07a",
        group: "Detail",
      },
      {
        id: "l4",
        name: "Guide_Line",
        visible: true,
        locked: true,
        pathData: "M160,100 C180,130 190,160 185,190",
        color: "#c4a06a",
        group: "Guides",
      },
    ],
    svgPreview: "",
  },
  {
    id: "proj-icon-pack",
    name: "Icon pack — batch of 6",
    status: "processing",
    folderId: "folder-recent",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    views: ["grid"],
    analysisModes: ["geometry"],
    tuning: defaultTuning,
    layers: [],
  },
  {
    id: "proj-product-photo",
    name: "Product photo — outline",
    status: "completed",
    folderId: "folder-recent",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    views: ["hero"],
    analysisModes: ["geometry", "detail"],
    tuning: defaultTuning,
    layers: [
      {
        id: "s1",
        name: "Outer_Silhouette",
        visible: true,
        locked: false,
        pathData:
          "M80,60 C160,40 300,40 380,70 C420,120 410,220 360,260 C280,300 160,300 90,250 C40,200 40,110 80,60 Z",
        color: "#8fae8b",
        group: "Silhouette",
      },
      {
        id: "s2",
        name: "Highlight_Region",
        visible: true,
        locked: false,
        pathData:
          "M140,100 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0 M200,90 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0 M260,100 m-12,0 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0",
        color: "#7a92a8",
        group: "Detail",
      },
    ],
  },
  {
    id: "proj-sketch",
    name: "Hand sketch — ink scan",
    status: "failed",
    folderId: "folder-recent",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    views: ["scan"],
    analysisModes: ["detail"],
    tuning: defaultTuning,
    layers: [],
  },
  {
    id: "proj-illustration",
    name: "Illustration crop — draft",
    status: "draft",
    folderId: "folder-archive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    views: ["crop-a", "crop-b", "crop-c"],
    analysisModes: ["geometry"],
    tuning: defaultTuning,
    layers: [],
  },
];
