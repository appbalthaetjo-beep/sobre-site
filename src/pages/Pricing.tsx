import { useEffect } from "react";
import { buildTrialReminderUrl } from "../lib/funnelIdentity";

export default function Pricing() {
  useEffect(() => {
    window.location.replace(buildTrialReminderUrl(window.location.search));
  }, []);

  return null;
}
