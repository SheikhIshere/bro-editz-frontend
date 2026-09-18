import { normalizeApiList } from "@/lib/services/contract";

export interface WorkTag {
  id: number;
  name: string;
}

export interface WorkResponse {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  video_url: string;
  publish_date: string | null;
  visibility: boolean;
  is_featured: boolean;
  tags: WorkTag[];
  created_at: string;
  updated_at: string;
}

export interface WorkFormPayload {
  title: string;
  description: string;
  video_url: string;
  publish_date?: string | null;
  visibility?: boolean;
  is_featured?: boolean;
  tags: number[];
  thumbnail?: File | null;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toBooleanValue(value: unknown): boolean {
  return value === true;
}

function toNumberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function normalizeWorkTags(input: unknown): WorkTag[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((tag) => {
      if (!tag || typeof tag !== "object") return null;

      const id = toNumberValue((tag as { id?: unknown }).id);
      const name = toStringValue((tag as { name?: unknown }).name).trim();

      if (id === null || name.length === 0) return null;

      return { id, name };
    })
    .filter((tag): tag is WorkTag => tag !== null);
}

export function normalizeWorks(payload: unknown): WorkResponse[] {
  const items = normalizeApiList<Record<string, unknown>>(payload);

  return items
    .map((item) => {
      const id = toNumberValue(item.id);
      const title = toStringValue(item.title).trim();
      const videoUrl = toStringValue(item.video_url).trim();

      if (id === null || title.length === 0 || videoUrl.length === 0) {
        return null;
      }

      return {
        id,
        title,
        description: toStringValue(item.description),
        thumbnail: toNullableString(item.thumbnail),
        video_url: videoUrl,
        publish_date: toNullableString(item.publish_date),
        visibility: toBooleanValue(item.visibility),
        is_featured: toBooleanValue(item.is_featured),
        tags: normalizeWorkTags(item.tags),
        created_at: toStringValue(item.created_at),
        updated_at: toStringValue(item.updated_at),
      };
    })
    .filter((item): item is WorkResponse => item !== null);
}

export function normalizeTags(payload: unknown): TagResponse[] {
  const items = normalizeApiList<Record<string, unknown>>(payload);

  return items
    .map((item) => {
      const id = toNumberValue(item.id);
      const name = toStringValue(item.name).trim();
      const slug = toStringValue(item.slug).trim();

      if (id === null || name.length === 0 || slug.length === 0) return null;

      return {
        id,
        name,
        slug,
        description:
          typeof item.description === "string" ? item.description : null,
        created_at: toStringValue(item.created_at),
        updated_at: toStringValue(item.updated_at),
      };
    })
    .filter((item): item is TagResponse => item !== null);
}

export function buildWorkPayload(
  payload: WorkFormPayload
): FormData | Record<string, unknown> {
  const tags = payload.tags
    .map((tagId) => Number.parseInt(String(tagId), 10))
    .filter((tagId) => Number.isFinite(tagId));

  const thumbnailFile = payload.thumbnail;
  const hasThumbnail = thumbnailFile instanceof File;

  if (hasThumbnail) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("video_url", payload.video_url);

    if (payload.publish_date) {
      formData.append("publish_date", payload.publish_date);
    }

    if (typeof payload.visibility === "boolean") {
      formData.append("visibility", String(payload.visibility));
    }

    if (typeof payload.is_featured === "boolean") {
      formData.append("is_featured", String(payload.is_featured));
    }

    tags.forEach((tagId) => {
      formData.append("tags", String(tagId));
    });

    formData.append("thumbnail", thumbnailFile);
    return formData;
  }

  return {
    title: payload.title,
    description: payload.description,
    video_url: payload.video_url,
    publish_date: payload.publish_date ?? null,
    visibility: payload.visibility,
    is_featured: payload.is_featured,
    tags,
  };
}
