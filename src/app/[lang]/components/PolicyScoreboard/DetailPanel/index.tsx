"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./style.module.css";

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  backLabel: string;
  children: React.ReactNode;
}

const DetailPanel = ({
  isOpen,
  onClose,
  title,
  backLabel,
  children,
}: DetailPanelProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default DetailPanel;
