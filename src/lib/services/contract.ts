export type AccentColor =
  | "accent-primary"
  | "accent-secondary"
  | "accent-tertiary"
  | "accent-quaternary";

export type ServiceIconType =
  | "VIDEO"
  | "REEL"
  | "AI"
  | "PODCAST"
  | "TEAM"
  | "COMMERCIAL"
  | "VISUAL";

export type IndustryType =
  | "SOCIAL"
  | "BRAND"
  | "PROFESSIONALS"
  | "AGENCY"
  | "PRODUCTION_HOUSE"
  | "INFLUENCER"
  | "COMPANY"
  | "LOCAL"
  | "INTERNATIONAL";

export type ServiceIconKey =
  | "video"
  | "film"
  | "brain"
  | "music"
  | "users"
  | "target"
  | "sparkles";

export type IndustryIconKey =
  | "share2"
  | "award"
  | "users"
  | "briefcase"
  | "film"
  | "star"
  | "building"
  | "target"
  | "trending-up";

export const SERVICE_ICON_TYPES: readonly ServiceIconType[] = [
  "VIDEO",
  "REEL",
  "AI",
  "PODCAST",
  "TEAM",
  "COMMERCIAL",
  "VISUAL",
] as const;

export const INDUSTRY_TYPES: readonly IndustryType[] = [
  "SOCIAL",
  "BRAND",
  "PROFESSIONALS",
  "AGENCY",
  "PRODUCTION_HOUSE",
  "INFLUENCER",
  "COMPANY",
  "LOCAL",
  "INTERNATIONAL",
] as const;

const serviceIconSet = new Set<string>(SERVICE_ICON_TYPES);
const industryTypeSet = new Set<string>(INDUSTRY_TYPES);

export const DEFAULT_SERVICE_ICON_TYPE: ServiceIconType = "VIDEO";
export const DEFAULT_INDUSTRY_TYPE: IndustryType = "BRAND";

export interface ServiceIconUiMeta {
  label: string;
  color: AccentColor;
  iconKey: ServiceIconKey;
}

export interface IndustryUiMeta {
  label: string;
  color: AccentColor;
  iconKey: IndustryIconKey;
}

export const SERVICE_ICON_UI_META: Record<ServiceIconType, ServiceIconUiMeta> = {
  VIDEO: { label: "Video", color: "accent-primary", iconKey: "video" },
  REEL: { label: "Reel", color: "accent-secondary", iconKey: "film" },
  AI: { label: "AI", color: "accent-tertiary", iconKey: "brain" },
  PODCAST: { label: "Podcast", color: "accent-quaternary", iconKey: "music" },
  TEAM: { label: "Team", color: "accent-primary", iconKey: "users" },
  COMMERCIAL: { label: "Commercial", color: "accent-secondary", iconKey: "target" },
  VISUAL: { label: "Visual", color: "accent-tertiary", iconKey: "sparkles" },
};

export const INDUSTRY_UI_META: Record<IndustryType, IndustryUiMeta> = {
  SOCIAL: { label: "Social", color: "accent-primary", iconKey: "share2" },
  BRAND: { label: "Brand", color: "accent-secondary", iconKey: "award" },
  PROFESSIONALS: { label: "Professionals", color: "accent-tertiary", iconKey: "users" },
  AGENCY: { label: "Agency", color: "accent-quaternary", iconKey: "briefcase" },
  PRODUCTION_HOUSE: { label: "Production House", color: "accent-primary", iconKey: "film" },
  INFLUENCER: { label: "Influencer", color: "accent-secondary", iconKey: "star" },
  COMPANY: { label: "Company", color: "accent-tertiary", iconKey: "building" },
  LOCAL: { label: "Local", color: "accent-quaternary", iconKey: "target" },
  INTERNATIONAL: { label: "International", color: "accent-primary", iconKey: "trending-up" },
};

export const SERVICE_ICON_OPTIONS = SERVICE_ICON_TYPES.map((value) => ({
  value,
  label: SERVICE_ICON_UI_META[value].label,
}));

export const INDUSTRY_TYPE_OPTIONS = INDUSTRY_TYPES.map((value) => ({
  value,
  label: INDUSTRY_UI_META[value].label,
}));

export function isServiceIconType(value: unknown): value is ServiceIconType {
  return typeof value === "string" && serviceIconSet.has(value);
}

export function isIndustryType(value: unknown): value is IndustryType {
  return typeof value === "string" && industryTypeSet.has(value);
}

export function normalizeServiceIconType(value: unknown): ServiceIconType {
  if (isServiceIconType(value)) return value;
  return DEFAULT_SERVICE_ICON_TYPE;
}

export function normalizeIndustryType(value: unknown): IndustryType {
  if (isIndustryType(value)) return value;
  return DEFAULT_INDUSTRY_TYPE;
}

export function getServiceIconUi(value: unknown): ServiceIconUiMeta {
  return SERVICE_ICON_UI_META[normalizeServiceIconType(value)];
}

export function getIndustryTypeUi(value: unknown): IndustryUiMeta {
  return INDUSTRY_UI_META[normalizeIndustryType(value)];
}

export function normalizeApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return (payload as { results: T[] }).results;
  }

  return [];
}
