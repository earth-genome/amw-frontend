// Shared by the download form (client) and its API route (server)

export const ORGANIZATION_TYPES = [
  "research_academia",
  "ngo_civil_society",
  "government_public_sector",
  "journalism_media",
  "private_sector",
  "indigenous_community_organization",
  "student",
  "other",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const RESOURCES = ["data", "code"] as const;
export type Resource = (typeof RESOURCES)[number];

export const LANGUAGES = ["en", "es", "pt"] as const;
export type Language = (typeof LANGUAGES)[number];

// ISO 3166-1 alpha-2, names are localized with Intl.DisplayNames
export const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU",
  "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL",
  "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC",
  "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV",
  "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG",
  "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD",
  "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT",
  "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM",
  "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH",
  "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK",
  "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH",
  "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW",
  "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR",
  "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR",
  "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC",
  "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL",
  "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY",
  "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA",
  "ZM", "ZW",
] as const;

export const LIMITS = {
  name: 200,
  organization: 200,
  email: 254,
  intendedUse: 1000,
} as const;

// Pragmatic, not RFC-complete
export const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// Control characters; tab/newline are allowed in free text
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
// eslint-disable-next-line no-control-regex
const ANY_CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

export type ErrorCode =
  | "required"
  | "too_long"
  | "invalid_email"
  | "invalid_option"
  | "invalid_value";

export interface MethodologyContactData {
  name: string;
  email: string;
  organization: string;
  organizationType?: OrganizationType;
  country?: string;
  intendedUse?: string;
  contactConsent: boolean;
  resource: Resource;
  language: Language;
}

export type MethodologyContactField = keyof MethodologyContactData;

export type ValidationResult =
  | { ok: true; data: MethodologyContactData }
  | {
      ok: false;
      errors: Partial<Record<MethodologyContactField, ErrorCode>>;
    };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

const collapseWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export const validateLine = (
  value: unknown,
  maxLength: number,
  required: boolean,
): { value?: string; error?: ErrorCode } => {
  if (value === undefined || value === null) {
    return required ? { error: "required" } : {};
  }
  if (typeof value !== "string") return { error: "invalid_value" };
  if (ANY_CONTROL_CHARS.test(value.replace(/[\t\n\r]/g, " "))) {
    return { error: "invalid_value" };
  }
  const cleaned = collapseWhitespace(value);
  if (!cleaned) return required ? { error: "required" } : {};
  if (cleaned.length > maxLength) return { error: "too_long" };
  return { value: cleaned };
};

export const validateEmail = (
  value: unknown,
): { value?: string; error?: ErrorCode } => {
  if (value === undefined || value === null) return { error: "required" };
  if (typeof value !== "string") return { error: "invalid_value" };
  const trimmed = value.trim();
  if (!trimmed) return { error: "required" };
  if (trimmed.length > LIMITS.email) return { error: "too_long" };
  if (!EMAIL_REGEX.test(trimmed)) return { error: "invalid_email" };
  // Lowercase the domain only
  const at = trimmed.lastIndexOf("@");
  return {
    value: `${trimmed.slice(0, at)}@${trimmed.slice(at + 1).toLowerCase()}`,
  };
};

const validateEnum = <T extends string>(
  value: unknown,
  options: readonly T[],
  required: boolean,
): { value?: T; error?: ErrorCode } => {
  if (value === undefined || value === null || value === "") {
    return required ? { error: "required" } : {};
  }
  if (typeof value !== "string") return { error: "invalid_value" };
  if (!(options as readonly string[]).includes(value)) {
    return { error: "invalid_option" };
  }
  return { value: value as T };
};

const validateMultiline = (
  value: unknown,
  maxLength: number,
): { value?: string; error?: ErrorCode } => {
  if (value === undefined || value === null) return {};
  if (typeof value !== "string") return { error: "invalid_value" };
  if (CONTROL_CHARS.test(value)) return { error: "invalid_value" };
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (trimmed.length > maxLength) return { error: "too_long" };
  return { value: trimmed };
};

export const validateMethodologyContact = (
  input: unknown,
): ValidationResult => {
  if (!isPlainObject(input)) {
    return { ok: false, errors: { name: "invalid_value" } };
  }

  const errors: Partial<Record<MethodologyContactField, ErrorCode>> = {};

  const name = validateLine(input.name, LIMITS.name, true);
  if (name.error) errors.name = name.error;

  const email = validateEmail(input.email);
  if (email.error) errors.email = email.error;

  const organization = validateLine(
    input.organization,
    LIMITS.organization,
    true,
  );
  if (organization.error) errors.organization = organization.error;

  const organizationType = validateEnum(
    input.organizationType,
    ORGANIZATION_TYPES,
    false,
  );
  if (organizationType.error) errors.organizationType = organizationType.error;

  const country = validateEnum(input.country, COUNTRY_CODES, false);
  if (country.error) errors.country = country.error;

  const intendedUse = validateMultiline(input.intendedUse, LIMITS.intendedUse);
  if (intendedUse.error) errors.intendedUse = intendedUse.error;

  let contactConsent = false;
  if (input.contactConsent !== undefined && input.contactConsent !== null) {
    if (typeof input.contactConsent !== "boolean") {
      errors.contactConsent = "invalid_value";
    } else {
      contactConsent = input.contactConsent;
    }
  }

  const resource = validateEnum(input.resource, RESOURCES, true);
  if (resource.error) errors.resource = resource.error;

  const language = validateEnum(input.language, LANGUAGES, true);
  if (language.error) errors.language = language.error;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const data: MethodologyContactData = {
    name: name.value!,
    email: email.value!,
    organization: organization.value!,
    contactConsent,
    resource: resource.value!,
    language: language.value!,
  };
  if (organizationType.value) data.organizationType = organizationType.value;
  if (country.value) data.country = country.value;
  if (intendedUse.value) data.intendedUse = intendedUse.value;

  return { ok: true, data };
};

// Hidden input that only bots fill
export const HONEYPOT_FIELD = "website";

export const SUBMITTED_STORAGE_KEY = "amw_methodology_contact_v1";
