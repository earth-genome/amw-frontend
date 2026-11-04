"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./style.module.css";
import { Button, ConfigProvider } from "antd";
import Link from "next/link";
import { LinkOutlined } from "@ant-design/icons";

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  backLabel: string;
  children: React.ReactNode;
  reportLink: string | undefined;
  dictionary?: { [key: string]: any };
}

const DetailPanel = ({
  isOpen,
  onClose,
  title,
  backLabel,
  dictionary,
  reportLink,
  children,
}: DetailPanelProps) => {
  const [mounted, setMounted] = useState(false);
  const [reportExists, setReportExists] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check that the PDF actually exists before showing the report button
  useEffect(() => {
    setReportExists(false);

    if (!reportLink) return;

    const controller = new AbortController();

    fetch(reportLink, { method: "HEAD", signal: controller.signal })
      .then((res) => {
        const contentType = res.headers.get("content-type") ?? "";
        setReportExists(res.ok && contentType.includes("application/pdf"));
      })
      .catch(() => {
        // Network error or aborted request: keep the button hidden
        if (!controller.signal.aborted) setReportExists(false);
      });

    return () => controller.abort();
  }, [reportLink]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={onClose}
      />
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        <div className={styles.panelContent}>
          <button onClick={onClose} className={styles.closeButton}>
            {backLabel}
          </button>
          <h1>{title}</h1>
          {reportLink && reportExists && (
            <Link href={reportLink}>
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimaryHover: "var(--green-dark)",
                    },
                  },
                  token: {
                    colorPrimaryHover: "var(--green-dark)",
                  },
                }}
              >
                <Button style={{ marginBottom: "26px" }}>
                  {dictionary?.policy_scoreboard?.download_report}{" "}
                  <LinkOutlined style={{ color: "var(--green-dark)" }} />
                </Button>
              </ConfigProvider>
            </Link>
          )}

          {children}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default DetailPanel;