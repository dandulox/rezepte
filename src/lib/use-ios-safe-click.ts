import { useEffect, useMemo, useRef } from "react";

/**
 * iOS/iPadOS: Nach touch end feuert oft zusätzlich ein synthetischer click —
 * bei Toggle-Buttons führt das zu doppeltem Handler (wirkt wie „reagiert nicht“).
 */
export function useIosSafeClick(onAction: () => void) {
  const actionRef = useRef(onAction);
  useEffect(() => {
    actionRef.current = onAction;
  });
  const lastTouchMs = useRef(0);

  return useMemo(
    () => ({
      onTouchEnd() {
        lastTouchMs.current = Date.now();
        actionRef.current();
      },
      onClick() {
        if (Date.now() - lastTouchMs.current < 500) return;
        actionRef.current();
      },
    }),
    [],
  );
}
