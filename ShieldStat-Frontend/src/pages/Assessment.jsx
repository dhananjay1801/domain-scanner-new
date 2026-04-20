import { useMemo, useState, useEffect } from "react";
import {
  ASSESSMENT_CATEGORIES_METADATA,
  getInitialSelections,
  getMetricColor,
  getMetricTextColor,
  getMetricStatus,
  getMetricStatusClasses,
  getCategoryCardClasses,
  getRadarPoint,
  getRadarGridPoints,
} from "../utils/assessmentUtils";
import { getAssessmentQuestions } from "../services/api";

function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState(getInitialSelections);
  const [activeCategoryId, setActiveCategoryId] = useState(1);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getAssessmentQuestions();
        setQuestions(data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);


  const metrics = useMemo(() => {
    if (!questions.length) return [];

    // Group questions by category
    const categories = Array.from(new Set(questions.map((q) => q.category_id)));

    return categories.map((catId) => {
      const catQuestions = questions.filter((q) => q.category_id === catId);
      const metadata = ASSESSMENT_CATEGORIES_METADATA[catId] || {
        label: `Category ${catId}`,
        axisLabel: `Cat ${catId}`,
        icon: "help",
        accent: { border: "", button: "", pill: "" },
      };

      let totalScore = 0;
      let availableMaxScore = 0;

      catQuestions.forEach((q) => {
        const selection = selections[q._id];
        const isIgnored = selections[`ignored_${q._id}`];

        if (!isIgnored) {
          availableMaxScore += 3; // Standard max score per question

          if (selection !== undefined) {
            const selectedOption = q.options.find((opt) => opt.option_key === selection);
            if (selectedOption) {
              totalScore += selectedOption.score;
            }
          }
        }
      });

      const value = availableMaxScore > 0 ? Math.round((totalScore / availableMaxScore) * 100) : 0;

      return {
        id: catId,
        ...metadata,
        questions: catQuestions,
        value,
        totalScore,
        maxPossibleScore: availableMaxScore
      };
    });
  }, [questions, selections]);

  const radarPoints = useMemo(() => {
    if (metrics.length < 3) return "";
    return metrics.map((m, i) => getRadarPoint(m.value, i, metrics.length)).join(" ");
  }, [metrics]);

  const handleSelect = (questionId, optionKey) => {
    const newSelections = {
      ...selections,
      [questionId]: optionKey,
      // If we select an answer, we automatically stop ignoring it
      [`ignored_${questionId}`]: false
    };
    setSelections(newSelections);
    localStorage.setItem("assessment_selections", JSON.stringify(newSelections));
  };

  const toggleIgnore = (questionId) => {
    setSelections((prev) => {
      const newSelections = {
        ...prev,
        [`ignored_${questionId}`]: !prev[`ignored_${questionId}`]
      };
      localStorage.setItem("assessment_selections", JSON.stringify(newSelections));
      return newSelections;
    });
  };

  const activeCategory = metrics.find((m) => m.id === activeCategoryId) || metrics[0];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-slate-500 font-medium">Loading Assessment Questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-12">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Security Assessment
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Security Assessment Profile
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Complete the assessment by selecting the option that best describes your current security posture.
            The results update in real-time.
          </p>
        </div>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="assessment-surface lg:col-span-2 flex flex-col items-center rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex w-full items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Spider Net Graph
              </h2>
              <p className="text-xs text-slate-500">
                Live score based on your answers
              </p>
            </div>

            <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
              Live
            </span>
          </div>

          <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center">
            {metrics.map((m, i) => {
              const [x, y] = getRadarPoint(115, i, metrics.length).split(",");
              return (
                <div
                  key={m.id}
                  className="absolute text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-24"
                  style={{ left: `${x / 4}%`, top: `${y / 4}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {m.axisLabel}
                </div>
              );
            })}

            <svg className="h-full w-full" viewBox="0 0 400 400">
              {/* Grids */}
              {[40, 80, 120, 160].map((r) => (
                <polygon
                  key={r}
                  points={getRadarGridPoints(r, metrics.length)}
                  fill="none"
                  stroke="#94a3b8"
                  strokeDasharray="4"
                />
              ))}

              {/* Axis lines */}
              {metrics.map((_, i) => {
                const [x, y] = getRadarPoint(100, i, metrics.length).split(",");
                return (
                  <line
                    key={i}
                    x1="200"
                    y1="200"
                    x2={x}
                    y2={y}
                    stroke="#94a3b8"
                  />
                );
              })}

              <polygon
                points={radarPoints}
                fill="rgba(79, 70, 229, 0.2)"
                stroke="#4f46e5"
                strokeWidth="2.5"
              />

              {radarPoints.split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");
                const value = metrics[index]?.value || 0;
                const fill = value >= 55 ? "#4f46e5" : "#e11d48";

                return <circle key={index} cx={cx} cy={cy} r="5" fill={fill} />;
              })}
            </svg>
          </div>
        </div>

        <div className="assessment-surface lg:col-span-2 rounded-3xl border bg-slate-50 p-8">
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

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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

      {activeCategory && (
        <section className="space-y-8 py-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {activeCategory.label} Questions
            </h2>
            <p className="mt-2 text-slate-600">
              Select one option for each question to evaluate your security posture in this category.
            </p>
          </div>

          <div className="space-y-6">
            {activeCategory.questions.map((q) => {
              const isIgnored = selections[`ignored_${q._id}`];
              return (
                <div
                  key={q._id}
                  className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 ${isIgnored
                    ? "border-slate-100 bg-slate-50/50 opacity-60 grayscale-[0.5]"
                    : "border-slate-200 bg-white"
                    }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h4 className={`text-lg font-bold ${isIgnored ? "text-slate-400" : "text-slate-800"}`}>
                      {q.question_text}
                    </h4>

                    <button
                      type="button"
                      onClick={() => toggleIgnore(q._id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${isIgnored
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isIgnored ? "visibility" : "visibility_off"}
                      </span>
                      {isIgnored ? "Unignore" : "Ignore"}
                    </button>
                  </div>

                  <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isIgnored ? "pointer-events-none" : ""}`}>
                    {q.options.map((opt) => {
                      const isSelected = selections[q._id] === opt.option_key;
                      return (
                        <button
                          key={opt.option_key}
                          type="button"
                          onClick={() => handleSelect(q._id, opt.option_key)}
                          className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${isSelected
                            ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 shadow-sm"
                            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                            }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 font-black text-sm transition-all ${isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                            }`}>
                            {opt.option_key}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <span className={`text-sm font-semibold leading-relaxed block ${isSelected ? "text-emerald-900" : "text-slate-700"}`}>
                              {opt.option_text}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default Assessment;



