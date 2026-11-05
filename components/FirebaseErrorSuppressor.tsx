"use client";

import { useEffect } from "react";

export default function FirebaseErrorSuppressor() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string" ? reason : reason?.message || "";
      const name = reason?.name || "";

      // Catch Firestore's internal AbortController abort signals
      if (
        name === "AbortError" ||
        message.includes("signal is aborted") ||
        message.includes("The user aborted a request")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () =>
      window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return null;
}
