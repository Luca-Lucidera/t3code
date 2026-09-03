import type { DesktopEnvironmentBootstrap } from "@t3tools/contracts";
import { useEffect, useState } from "react";

import { readDesktopPrimaryWslDistro, readDesktopSecondaryBootstraps } from "./desktopLocal";

const DESKTOP_LOCAL_BOOTSTRAP_POLL_MS = 2_000;

/**
 * Reactively track the desktop's secondary local backends (e.g. a parallel WSL
 * backend). The bridge exposes no change event, so we re-read on an interval;
 * failed reads retain the latest successful snapshot, while a successful empty
 * read clears it. Use this instead of polling the bridge ad hoc so every
 * renderer consumer reads the same topology.
 */
export function useDesktopLocalBootstraps(): ReadonlyArray<DesktopEnvironmentBootstrap> {
  const [bootstraps, setBootstraps] = useState<ReadonlyArray<DesktopEnvironmentBootstrap>>(
    readDesktopSecondaryBootstraps,
  );

  useEffect(() => {
    const read = () => setBootstraps(readDesktopSecondaryBootstraps());
    read();
    const interval = setInterval(read, DESKTOP_LOCAL_BOOTSTRAP_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return bootstraps;
}

/** Reactively track the primary backend's WSL distro (wsl-only mode). */
export function useDesktopPrimaryWslDistro(): string | null {
  const [distro, setDistro] = useState<string | null>(() => readDesktopPrimaryWslDistro());

  useEffect(() => {
    if (window.desktopBridge === undefined) return;
    const read = () => setDistro(readDesktopPrimaryWslDistro());
    read();
    const interval = setInterval(read, DESKTOP_LOCAL_BOOTSTRAP_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return distro;
}
