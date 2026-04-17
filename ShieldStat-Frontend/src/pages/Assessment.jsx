import { useMemo, useState } from "react";
import {
  ASSESSMENT_CATEGORIES,
  getInitialSelections,
  getMetricColor,
  getMetricTextColor,
  getMetricStatus,
  getMetricStatusClasses,
  getCategoryCardClasses,
  getRadarPoint,
} from "../utils/assessmentUtils";

function Assessment() {
  const [selections, setSelections] = useState(getInitialSelections);
  const [activeCategoryId, setActiveCategoryId] = useState(
    ASSESSMENT_CATEGORIES[0].id,
  );

  const metrics = useMemo(() => {
    return ASSESSMENT_CATEGORIES.map((category) => {
      const selectedCount = category.items.filter(
        (item) => selections[category.id]?.[item.id],
      ).length;
      const value = Math.round((selectedCount / category.items.length) * 100);

      return {
        ...category,
        selectedCount,
        value,
      };
    });
  }, [selections]);

  const radarPoints = useMemo(() => {
    const [network, application, dns, endpoint] = metrics;

    return [
      getRadarPoint(network.value, "top"),
      getRadarPoint(application.value, "right"),
      getRadarPoint(dns.value, "bottom"),
      getRadarPoint(endpoint.value, "left"),
    ].join(" ");
  }, [metrics]);

  const toggleItem = (categoryId, itemId) => {
    setSelections((current) => ({
      ...current,
      [categoryId]: {
        ...current[categoryId],
        [itemId]: !current[categoryId][itemId],
      },
    }));
  };

  const activeCategory =
    metrics.find((metric) => metric.id === activeCategoryId) ?? metrics[0];

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-12">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Active Assessment
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Security Assessment Profile
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Tick the controls that are currently true in each category and the
            spider graph will update in real time.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-700">
          <span className="material-symbols-outlined text-xl">download</span>
          Download Report
        </button>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-2 flex flex-col items-center rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex w-full items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Spider Net Security Graph
              </h2>
              <p className="text-xs text-slate-500">
                Live score based on checked assessment points
              </p>
            </div>

            <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
              Live
            </span>
          </div>

          <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-slate-500">
              {metrics[0].axisLabel}
            </div>
            <div className="absolute right-0 top-1/2 translate-x-6 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-slate-500">
              {metrics[1].axisLabel}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-slate-500">
              {metrics[2].axisLabel}
            </div>
            <div className="absolute left-0 top-1/2 -translate-x-6 -translate-y-1/2 text-xs font-bold uppercase tracking-widest text-slate-500">
              {metrics[3].axisLabel}
            </div>

            <svg className="h-full w-full" viewBox="0 0 400 400">
              <polygon points="200,40 360,200 200,360 40,200" fill="none" stroke="#dce4e8" strokeDasharray="4" />
              <polygon points="200,80 320,200 200,320 80,200" fill="none" stroke="#dce4e8" strokeDasharray="4" />
              <polygon points="200,120 280,200 200,280 120,200" fill="none" stroke="#dce4e8" strokeDasharray="4" />
              <polygon points="200,160 240,200 200,240 160,200" fill="none" stroke="#dce4e8" strokeDasharray="4" />
              <line x1="200" y1="40" x2="200" y2="360" stroke="#dce4e8" />
              <line x1="40" y1="200" x2="360" y2="200" stroke="#dce4e8" />

              <polygon
                points={radarPoints}
                fill="rgba(92,90,139,0.18)"
                stroke="#5c5a8b"
                strokeWidth="2.5"
              />

              {radarPoints.split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");
                const value = metrics[index].value;
                const fill = value >= 55 ? "#5c5a8b" : "#a8364b";

                return <circle key={metrics[index].id} cx={cx} cy={cy} r="5" fill={fill} />;
              })}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl border bg-slate-50 p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            Metric Breakdown
          </h2>

          <div className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">
                    {metric.label}
                  </span>
                  <span className={`font-black ${getMetricTextColor(metric.value)}`}>
                    {metric.value}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getMetricColor(metric.value)}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            type="button"
            onClick={() => setActiveCategoryId(metric.id)}
            className={`rounded-2xl border p-5 text-center shadow-sm transition-all duration-200 active:scale-[0.98] ${getCategoryCardClasses(
              activeCategoryId === metric.id,
            )}`}
          >
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${activeCategoryId === metric.id
                  ? "bg-white/15 text-white ring-4 ring-white/10"
                  : "bg-indigo-50 text-indigo-600"
                }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {metric.icon}
              </span>
            </div>
            <h3
              className={`mb-2 text-sm font-bold uppercase tracking-wider ${activeCategoryId === metric.id ? "text-white" : "text-slate-700"
                }`}
            >
              {metric.label}
            </h3>

            <div className="mb-3 text-2xl font-black">
              {metric.value}%
            </div>

            <span
              className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-black uppercase ${activeCategoryId === metric.id
                  ? "border-white/25 bg-white/10 text-white"
                  : getMetricStatusClasses(metric.value)
                }`}
            >
              {getMetricStatus(metric.value)}
            </span>
          </button>
        ))}
      </div>

      <section className="space-y-6 py-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Assessment Checklist
          </h2>
          <p className="mt-2 text-slate-600">
            Click a category card above to open its checklist. Then click each
            point to mark it true or false.
          </p>
        </div>

        <div
          className={`rounded-3xl border bg-white p-6 shadow-sm ${activeCategory.accent.border}`}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${activeCategory.accent.button}`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {activeCategory.icon}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {activeCategory.label}
                </h3>
                <p className="text-sm text-slate-500">
                  {activeCategory.selectedCount}/{activeCategory.items.length} controls active
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${activeCategory.accent.pill}`}
            >
              Selected
            </span>
          </div>

          <div className="space-y-3">
            {activeCategory.items.map((item) => {
              const checked = selections[activeCategory.id][item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(activeCategory.id, item.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${checked
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/40"
                    }`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${checked
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {checked ? "check" : "radio_button_unchecked"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {item.label}
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.detail}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${checked
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-500"
                          }`}
                      >
                        {checked ? "True" : "False"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Assessment;
