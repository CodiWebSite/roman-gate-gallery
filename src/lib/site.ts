import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  { value: "rustice", label: "Rustice" },
  { value: "moderne", label: "Moderne" },
  { value: "stejar", label: "Stejar" },
  { value: "curti", label: "Curți" },
  { value: "detalii", label: "Detalii lemn" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;

export interface Project {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  category: string;
  image_url: string;
  alt_text: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export interface ProjectSketch {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface ProjectPhoto {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  author: string;
  location: string | null;
  content: string;
  rating: number;
  published: boolean;
  sort_order: number;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Bună ziua! Sunt interesat de o poartă din lemn și aș dori o ofertă.";

export function useSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((row) => {
        if (row.value != null) map[row.key] = row.value;
      });
      return map;
    },
  });
}

export function whatsappLink(number: string | undefined, message = DEFAULT_WHATSAPP_MESSAGE) {
  const clean = (number ?? "40712345678").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function usePublishedProjects() {
  return useQuery({
    queryKey: ["projects", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });
}

export function usePublishedSketches() {
  return useQuery({
    queryKey: ["project_sketches", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_sketches")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const map: Record<string, ProjectSketch[]> = {};
      (data ?? []).forEach((s) => {
        (map[s.project_id] ??= []).push(s as ProjectSketch);
      });
      return map;
    },
  });
}

export function usePublishedPhotos() {
  return useQuery({
    queryKey: ["project_photos", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const map: Record<string, ProjectPhoto[]> = {};
      (data ?? []).forEach((p) => {
        (map[p.project_id] ??= []).push(p as ProjectPhoto);
      });
      return map;
    },
  });
}



export function usePublishedVideos() {
  return useQuery({
    queryKey: ["videos", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as VideoItem[];
    },
  });
}

export function usePublishedTestimonials() {
  return useQuery({
    queryKey: ["testimonials", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Testimonial[];
    },
  });
}
