export const ASSESSMENT_CATEGORIES = [
  {
    id: "network",
    label: "Network Security",
    axisLabel: "Network",
    icon: "router",
    accent: {
      button: "bg-cyan-500 text-white",
      pill: "bg-cyan-100 text-cyan-700",
    },
    items: [
      {
        id: "firewall",
        label: "Firewall policy review",
        detail: "Inbound rules are restricted to approved ports and trusted IP ranges.",
      },
      {
        id: "segmentation",
        label: "Network segmentation",
        detail: "Critical services are isolated from public-facing systems.",
      },
      {
        id: "monitoring",
        label: "Traffic monitoring",
        detail: "Suspicious lateral movement triggers alerts in real time.",
      },
    ],
  },
  {
    id: "application",
    label: "Application Security",
    axisLabel: "Application",
    icon: "code",
    accent: {
      button: "bg-violet-500 text-white",
      pill: "bg-violet-100 text-violet-700",
    },
    items: [
      {
        id: "sast",
        label: "Secure code checks",
        detail: "Pull requests are scanned before deployment to production.",
      },
      {
        id: "auth",
        label: "Authentication hardening",
        detail: "MFA and strong session controls are enforced for privileged users.",
      },
      {
        id: "deps",
        label: "Dependency hygiene",
        detail: "Outdated packages are reviewed and patched on a regular cadence.",
      },
    ],
  },
  {
    id: "dns",
    label: "DNS Health",
    axisLabel: "DNS Health",
    icon: "dns",
    accent: {
      button: "bg-emerald-500 text-white",
      pill: "bg-emerald-100 text-emerald-700",
    },
    items: [
      {
        id: "records",
        label: "Record inventory",
        detail: "Unused or stale DNS records are removed from active zones.",
      },
      {
        id: "dmarc",
        label: "Email protections",
        detail: "SPF, DKIM, and DMARC are configured for domain integrity.",
      },
      {
        id: "failover",
        label: "Resolver resilience",
        detail: "DNS failover and uptime monitoring are configured and tested.",
      },
    ],
  },
  {
    id: "endpoint",
    label: "Endpoint Security",
    axisLabel: "Endpoint",
    icon: "devices",
    accent: {
      button: "bg-rose-500 text-white",
      pill: "bg-rose-100 text-rose-700",
    },
    items: [
      {
        id: "edr",
        label: "EDR coverage",
        detail: "All managed laptops and servers report to the endpoint security console.",
      },
      {
        id: "patching",
        label: "Patch compliance",
        detail: "Critical OS and browser patches are applied within SLA.",
      },
      {
        id: "encryption",
        label: "Disk encryption",
        detail: "Portable workstations use enforced full-disk encryption.",
      },
    ],
  },
];

export function getInitialSelections() {
  return ASSESSMENT_CATEGORIES.reduce((categoryAccumulator, category) => {
    categoryAccumulator[category.id] = category.items.reduce(
      (itemAccumulator, item, index) => {
        // Initial state sets 2 items as true for demo purposes to give non-trivial score
        itemAccumulator[item.id] = index < 2;
        return itemAccumulator;
      },
      {},
    );
    return categoryAccumulator;
  }, {});
}

export function getMetricColor(value) {
  if (value >= 80) return "bg-emerald-500";
  if (value <= 33) return "bg-red-500";
  if (value >= 55) return "bg-indigo-500";
  return "bg-rose-500";
}

export function getMetricTextColor(value) {
  if (value >= 80) return "text-emerald-600";
  if (value <= 33) return "text-rose-600";
  if (value >= 55) return "text-indigo-600";
  return "text-rose-600";
}

export function getMetricStatus(value) {
  if (value >= 80) return "Secure";
  if (value >= 55) return "Good";
  return "At Risk";
}

export function getMetricStatusClasses(value) {
  if (value >= 80) return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (value >= 55) return "border-indigo-100 bg-indigo-50 text-indigo-700";
  return "border-rose-100 bg-rose-50 text-rose-700";
}

export function getCategoryCardClasses(isActive) {
  if (isActive) return "border-indigo-500 bg-indigo-600 text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] -translate-y-1 scale-[1.02]";
  return "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md";
}

export function getRadarPoint(value, axis) {
  const center = 200;
  const maxRadius = 160;
  const ratio = value / 100;

  if (axis === "top") return `${center},${center - maxRadius * ratio}`;
  if (axis === "right") return `${center + maxRadius * ratio},${center}`;
  if (axis === "bottom") return `${center},${center + maxRadius * ratio}`;
  return `${center - maxRadius * ratio},${center}`;
}
