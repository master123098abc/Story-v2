export type Step = "setup" | "scenes" | "images";

export interface GeneratedImage {
  scenePrompt: string;
  blobUrl?: string;
  status: "pending" | "generating" | "success" | "error";
  errorMessage?: string;
}
