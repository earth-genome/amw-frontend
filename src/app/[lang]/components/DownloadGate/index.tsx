"use client";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  Checkbox,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Select,
} from "antd";
import type { Rule } from "antd/es/form";
import type en from "@root/dictionaries/en.json";
import { event } from "@/google-analytics";
import {
  COUNTRY_CODES,
  ErrorCode,
  HONEYPOT_FIELD,
  LIMITS,
  MethodologyContactField,
  ORGANIZATION_TYPES,
  Resource,
  SUBMITTED_STORAGE_KEY,
  validateEmail,
  validateLine,
} from "@/utils/methodologyContact";
import "./style.css";

type FormDictionary = (typeof en)["methodology_form"];

// In-memory fallback, shared by every DownloadGateProvider on the page: when
// localStorage is unavailable (private mode, blocked site data, some in-app
// browsers), the form would otherwise be shown, and submitted, again on the
// next download. Lasts until the page is reloaded
let submittedInMemory = false;

// localStorage may be unavailable (private mode), then the form is shown again
// after a reload
const hasSubmitted = (): boolean => {
  if (submittedInMemory) return true;
  try {
    return window.localStorage.getItem(SUBMITTED_STORAGE_KEY) !== null;
  } catch (_e) {
    return false;
  }
};

const markSubmitted = () => {
  submittedInMemory = true;
  try {
    window.localStorage.setItem(
      SUBMITTED_STORAGE_KEY,
      JSON.stringify({ submittedAt: new Date().toISOString() }),
    );
  } catch (_e) {
    // ignore
  }
};

// Returns false if the browser blocked the new tab
const openInNewTab = (href: string): boolean => {
  const newWindow = window.open(href, "_blank");
  if (!newWindow) return false;
  try {
    newWindow.opener = null;
  } catch (_e) {
    // ignore
  }
  return true;
};

interface PendingRequest {
  resource: Resource;
  // Runs once access is granted. Returns false if the browser blocked it (e.g. the
  // new tab), then the person can run it again from the success screen
  onAccess: () => boolean | void;
}

interface DownloadGateContextValue {
  requestAccess: (_request: PendingRequest) => void;
}

const DownloadGateContext = createContext<DownloadGateContextValue | null>(
  null,
);

// Visible form fields, used to map server-side errors back onto them
const FORM_FIELDS = [
  "name",
  "email",
  "organization",
  "organizationType",
  "country",
  "intendedUse",
  "contactConsent",
] as const;

interface FormValues {
  name?: string;
  email?: string;
  organization?: string;
  organizationType?: string;
  country?: string;
  intendedUse?: string;
  contactConsent?: boolean;
  [HONEYPOT_FIELD]?: string;
}

interface DownloadGateProviderProps {
  dictionary: FormDictionary;
  lang: string;
  children: ReactNode;
}

export const DownloadGateProvider = ({
  dictionary,
  lang,
  children,
}: DownloadGateProviderProps) => {
  const [form] = Form.useForm<FormValues>();
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Synchronous guard against double submits: `submitting` only disables the
  // form after a re-render, so a fast double click or Enter + click can call
  // handleFinish twice before that and create two entries in Strapi
  const submittingRef = useRef(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Set when access is granted but the browser blocked the new tab
  const [blocked, setBlocked] = useState(false);

  const errorMessage = useCallback(
    (code: ErrorCode | string) =>
      dictionary.errors[code as keyof FormDictionary["errors"]] ||
      dictionary.errors.invalid_value,
    [dictionary],
  );

  const requestAccess = useCallback((request: PendingRequest) => {
    setSubmitError(null);
    if (hasSubmitted()) {
      if (request.onAccess() !== false) return;
      setBlocked(true);
    } else {
      setBlocked(false);
    }
    setPending(request);
  }, []);

  const close = () => {
    setPending(null);
    setSubmitError(null);
    setBlocked(false);
  };

  const countryOptions = useMemo(() => {
    let displayNames: Intl.DisplayNames | null = null;
    try {
      displayNames = new Intl.DisplayNames([lang], { type: "region" });
    } catch (_e) {
      displayNames = null;
    }
    return COUNTRY_CODES.map((code) => ({
      value: code,
      label: displayNames?.of(code) || code,
    })).sort((a, b) => a.label.localeCompare(b.label, lang));
  }, [lang]);

  const organizationTypeOptions = ORGANIZATION_TYPES.map((type) => ({
    value: type,
    label: dictionary.organization_types[type],
  }));

  // Same validators as the API route
  const lineRule =
    (maxLength: number): Rule =>
    () => ({
      validator(_rule, value) {
        const { error } = validateLine(value, maxLength, true);
        return error
          ? Promise.reject(new Error(errorMessage(error)))
          : Promise.resolve();
      },
    });

  const emailRule: Rule = () => ({
    validator(_rule, value) {
      const { error } = validateEmail(value);
      return error
        ? Promise.reject(new Error(errorMessage(error)))
        : Promise.resolve();
    },
  });

  const handleFinish = async (values: FormValues) => {
    if (!pending || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/methodology-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          organization: values.organization,
          organizationType: values.organizationType || undefined,
          country: values.country || undefined,
          intendedUse: values.intendedUse || undefined,
          contactConsent: Boolean(values.contactConsent),
          resource: pending.resource,
          language: lang,
          [HONEYPOT_FIELD]: values[HONEYPOT_FIELD] || "",
        }),
      });

      if (response.status === 400) {
        const body = await response.json().catch(() => ({}));
        const errors: Partial<Record<MethodologyContactField, ErrorCode>> =
          body?.errors || {};
        const fieldErrors = Object.entries(errors)
          .filter(([field]) =>
            (FORM_FIELDS as readonly string[]).includes(field),
          )
          .map(([field, code]) => ({
            name: field as keyof FormValues,
            errors: [errorMessage(code as ErrorCode)],
          }));
        if (fieldErrors.length > 0) {
          form.setFields(fieldErrors);
        } else {
          setSubmitError(dictionary.errors.generic);
        }
        return;
      }

      if (response.status === 429) {
        setSubmitError(dictionary.errors.rate_limited);
        return;
      }

      if (!response.ok) {
        setSubmitError(dictionary.errors.generic);
        return;
      }

      markSubmitted();
      try {
        event({
          action: "methodology_contact_submit",
          category: "downloads",
          label: pending.resource,
          value: undefined,
        });
      } catch (_e) {
        // analytics must never block the download
      }

      form.resetFields();
      if (pending.onAccess() !== false) {
        close();
      } else {
        setBlocked(true);
      }
    } catch (_e) {
      setSubmitError(dictionary.errors.generic);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const title =
    pending?.resource === "code"
      ? dictionary.title_code
      : dictionary.title_data;
  const continueLabel =
    pending?.resource === "code"
      ? dictionary.continue_code
      : dictionary.continue_data;

  const optionalTag = (
    <span className="download-gate-optional">({dictionary.optional})</span>
  );

  return (
    <DownloadGateContext.Provider value={{ requestAccess }}>
      {children}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#006837",
            colorLink: "#006837",
            fontFamily: "var(--body-text-font)",
            borderRadius: 6,
          },
        }}
      >
        <Modal
          open={pending !== null}
          onCancel={close}
          title={blocked ? dictionary.success_title : title}
          footer={null}
          width={520}
          className="download-gate-modal"
        >
          {blocked ? (
            <div className="download-gate-success">
              <p>{dictionary.success_text}</p>
              <button
                type="button"
                className="amw-btn"
                onClick={() => {
                  pending?.onAccess();
                  close();
                }}
              >
                {continueLabel}
              </button>
            </div>
          ) : (
            <>
              <p className="download-gate-intro">{dictionary.intro}</p>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                disabled={submitting}
                validateTrigger="onBlur"
              >
                <Form.Item
                  name="name"
                  label={dictionary.name}
                  required
                  rules={[lineRule(LIMITS.name)]}
                >
                  <Input
                    autoComplete="name"
                    placeholder={dictionary.name_placeholder}
                    maxLength={LIMITS.name}
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  label={dictionary.email}
                  required
                  rules={[emailRule]}
                >
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={dictionary.email_placeholder}
                    maxLength={LIMITS.email}
                  />
                </Form.Item>
                <Form.Item
                  name="organization"
                  label={dictionary.organization}
                  required
                  rules={[lineRule(LIMITS.organization)]}
                >
                  <Input
                    autoComplete="organization"
                    placeholder={dictionary.organization_placeholder}
                    maxLength={LIMITS.organization}
                  />
                </Form.Item>
                <div className="download-gate-row">
                  <Form.Item
                    name="organizationType"
                    label={
                      <>
                        {dictionary.organization_type} {optionalTag}
                      </>
                    }
                  >
                    <Select
                      allowClear
                      placeholder={dictionary.organization_type_placeholder}
                      options={organizationTypeOptions}
                    />
                  </Form.Item>
                  <Form.Item
                    name="country"
                    label={
                      <>
                        {dictionary.country} {optionalTag}
                      </>
                    }
                  >
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      placeholder={dictionary.country_placeholder}
                      options={countryOptions}
                    />
                  </Form.Item>
                </div>
                <Form.Item
                  name="intendedUse"
                  label={
                    <>
                      {dictionary.intended_use} {optionalTag}
                    </>
                  }
                >
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    placeholder={dictionary.intended_use_placeholder}
                    maxLength={LIMITS.intendedUse}
                    showCount
                  />
                </Form.Item>
                <Form.Item name="contactConsent" valuePropName="checked">
                  <Checkbox>{dictionary.contact_consent}</Checkbox>
                </Form.Item>

                {/* Honeypot, hidden from people */}
                <div className="download-gate-hp" aria-hidden="true">
                  <Form.Item name={HONEYPOT_FIELD}>
                    <Input tabIndex={-1} autoComplete="off" />
                  </Form.Item>
                </div>

                <p className="download-gate-privacy">
                  {dictionary.privacy_note}{" "}
                  <a
                    href={`/${lang}/privacy-policy`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dictionary.privacy_link}
                  </a>
                </p>
                <p className="download-gate-required-note">
                  <span className="download-gate-asterisk">*</span>{" "}
                  {dictionary.required_note}
                </p>

                {submitError && (
                  <Alert
                    type="error"
                    message={submitError}
                    showIcon
                    className="download-gate-alert"
                  />
                )}

                <div className="download-gate-actions">
                  <Button onClick={close} disabled={submitting}>
                    {dictionary.cancel}
                  </Button>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    {dictionary.submit}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal>
      </ConfigProvider>
    </DownloadGateContext.Provider>
  );
};

// Gates a download behind the form: `onAccess` runs right away if the form was
// already submitted in this browser, otherwise once it is submitted
export const useDownloadGate = () => {
  const context = useContext(DownloadGateContext);
  if (!context) {
    throw new Error(
      "useDownloadGate must be used within a DownloadGateProvider",
    );
  }
  return context.requestAccess;
};

interface GatedDownloadButtonProps {
  resource: Resource;
  href: string;
  labelHtml: string; // inline markdown, rendered on the server
}

// A button rather than a link, so the URL can only be reached via the form
export const GatedDownloadButton = ({
  resource,
  href,
  labelHtml,
}: GatedDownloadButtonProps) => {
  const context = useContext(DownloadGateContext);

  return (
    <p className="download-gate-button">
      <button
        type="button"
        className="amw-btn"
        onClick={() =>
          context?.requestAccess({
            resource,
            onAccess: () => openInNewTab(href),
          })
        }
        dangerouslySetInnerHTML={{ __html: labelHtml }}
      />
    </p>
  );
};
