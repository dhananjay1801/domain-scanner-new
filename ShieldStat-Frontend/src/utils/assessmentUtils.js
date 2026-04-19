export const ASSESSMENT_CATEGORIES_METADATA = {
  1: {
    id: 1,
    label: "Asset & Access Management",
    axisLabel: "Asset & Access",
    icon: "shield_person",
    accent: {
      button: "bg-cyan-500 text-white",
      pill: "bg-cyan-100 text-cyan-700",
      border: "border-cyan-200",
    },
  },
  2: {
    id: 2,
    label: "Network & Data Protection",
    axisLabel: "Network & Data",
    icon: "network_check",
    accent: {
      button: "bg-violet-500 text-white",
      pill: "bg-violet-100 text-violet-700",
      border: "border-violet-200",
    },
  },
  3: {
    id: 3,
    label: "Governance & Response",
    axisLabel: "Governance",
    icon: "fact_check",
    accent: {
      button: "bg-emerald-500 text-white",
      pill: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200",
    },
  },
};

export const ASSESSMENT_CATEGORIES = Object.values(ASSESSMENT_CATEGORIES_METADATA);

export function getInitialSelections() {
  const saved = localStorage.getItem("assessment_selections");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved selections", e);
    }
  }
  return {};
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
  if (value > 0) return "At Risk";
  return "Not Started";
}

export function getMetricStatusClasses(value) {
  if (value >= 80) return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (value >= 55) return "border-indigo-100 bg-indigo-50 text-indigo-700";
  if (value > 0) return "border-rose-100 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-500";
}

export function getCategoryCardClasses(isActive) {
  if (isActive) return "border-indigo-500 bg-indigo-600 text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] -translate-y-1 scale-[1.02]";
  return "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md";
}

export function getRadarPoint(value, index, total = 3) {
  const center = 200;
  const maxRadius = 160;
  const ratio = value / 100;
  const radius = maxRadius * ratio;

  // For 3 points (Triangle):
  // 0: Top (270 deg)
  // 1: Bottom Right (30 deg)
  // 2: Bottom Left (150 deg)

  const angleDeg = (index * (360 / total)) - 90;
  const angleRad = (Math.PI / 180) * angleDeg;

  const x = center + radius * Math.cos(angleRad);
  const y = center + radius * Math.sin(angleRad);

  return `${x},${y}`;
}

export function getRadarGridPoints(radius, total = 3) {
  const center = 200;
  const points = [];
  for (let i = 0; i < total; i++) {
    const angleDeg = (i * (360 / total)) - 90;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

