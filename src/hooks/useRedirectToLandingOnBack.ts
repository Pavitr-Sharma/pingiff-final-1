import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UseRedirectToLandingOnBackOptions {
  /** When false, hook does nothing */
  enabled?: boolean;
  /** Query param added so Landing can optionally skip auth redirect */
  landingQuery?: string;
}

/**
 * Forces browser back (including mobile swipe-back) to redirect to Landing.
 *
 * Implementation detail: we push a dummy history state and intercept `popstate`.
 */
export function useRedirectToLandingOnBack({
  enabled = true,
  landingQuery = "from=back",
}: UseRedirectToLandingOnBackOptions = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    // Add a dummy entry so the next back gesture triggers popstate within this page.
    try {
      window.history.pushState({ __lovable_back_trap: true }, "", window.location.href);
    } catch {
      // ignore
    }

    const onPopState = () => {
      navigate(`/?${landingQuery}`, { replace: true });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [enabled, landingQuery, navigate]);
}
