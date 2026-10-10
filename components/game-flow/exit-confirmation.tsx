"use client";

import { useEffect, useRef } from "react";

import styles from "./game-flow.module.css";

type ExitConfirmationProps = {
  onKeepPlaying: () => void;
  onLeave: () => void;
  open: boolean;
};

export function ExitConfirmation({
  onKeepPlaying,
  onLeave,
  open,
}: ExitConfirmationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keepPlayingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      keepPlayingRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-labelledby="exit-dialog-title"
      aria-describedby="exit-dialog-description"
      className={styles.exitDialog}
      onCancel={(event) => {
        event.preventDefault();
        onKeepPlaying();
      }}
      ref={dialogRef}
    >
      <div className={styles.exitDialogIcon} aria-hidden="true">
        ×
      </div>
      <div className={styles.exitDialogCopy}>
        <p className={styles.eyebrow}>Demo session</p>
        <h2 id="exit-dialog-title">Leave game?</h2>
        <p id="exit-dialog-description">
          Your current demo progress will be cleared. Nothing has been saved.
        </p>
      </div>
      <div className={styles.dialogActions}>
        <button
          className={styles.primaryButton}
          onClick={onKeepPlaying}
          ref={keepPlayingRef}
          type="button"
        >
          Keep playing
        </button>
        <button
          className={styles.textButton}
          onClick={onLeave}
          type="button"
        >
          Leave demo
        </button>
      </div>
    </dialog>
  );
}
