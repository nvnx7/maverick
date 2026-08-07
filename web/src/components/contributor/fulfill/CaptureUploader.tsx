"use client";

import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/dashboard";
import { useEffect, useState } from "react";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import { useFulfill } from "./FulfillContext";

/** Selection only — hashing and submission are handled after this, deliberately. */
export function CaptureUploader() {
  const { setFiles, setUploadTarget, setUploaded, setDataHash, setSignature } =
    useFulfill();
  const [uppy] = useState(
    () =>
      new Uppy({
        autoProceed: false,
        restrictions: { maxNumberOfFiles: 25 },
      }),
  );

  useEffect(() => {
    // Changing the selection invalidates any upload, hash, and signature already produced.
    const sync = () => {
      setFiles(uppy.getFiles().map((file) => file.data as File));
      setUploadTarget(null);
      setUploaded(false);
      setDataHash(null);
      setSignature(null);
    };

    uppy.on("file-added", sync);
    uppy.on("file-removed", sync);
    return () => {
      uppy.off("file-added", sync);
      uppy.off("file-removed", sync);
    };
  }, [uppy, setFiles, setUploadTarget, setUploaded, setDataHash, setSignature]);

  return (
    <Dashboard
      uppy={uppy}
      height={300}
      width="100%"
      theme="dark"
      hideUploadButton
      proudlyDisplayPoweredByUppy={false}
      note="Files are hashed on this device before anything is uploaded."
    />
  );
}
