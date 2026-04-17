"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  X,
  Plus,
  Save,
  Telescope,
  RefreshCw,
  MessageSquare,
  Lightbulb,
  Sparkles,
  HelpCircle,
  BadgeDollarSign,
} from "lucide-react";
import Link from "next/link";
import { JOB_STATUSES, LOCATION_TYPES, JOB_TYPES } from "@/lib/types";

type App = {
  id: string;
  companyName: string;
  companyWebsite: string | null;
  industry: string | null;
  jobTitle: string;
  jobUrl: string | null;
  locationType: string;
  location: string | null;
  jobType: string;
  status: string;
  salaryRange: string | null;
  whatTheyExpect: string | null;
  whatIExpect: string | null;
  whyIApplied: string | null;
  interviewNotes: string | null;
  vibeCheck: string | null;
  companyResearch: string | null;
  salaryResearch: string | null;
};

type ExpectedQuestion = { question: string; tip: string };

type ResearchData = {
  questions: string[];
  insights: string[];
  talkingPoints: string[];
  expectedQuestions: ExpectedQuestion[];
};

type SalaryResearch = {
  estimate: string;
  netEstimate: string | null;
  basis: string;
  breakdown: string[];
  scaleReference: string | null;
  locationAdjustment: string | null;
  benefitsToFactor: string[];
  payTransparencyNote: string | null;
  notes: string | null;
};

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const inputCls =
  "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function TagList({ tags, onChange, editing }: { tags: string[]; onChange: (t: string[]) => void; editing: boolean }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  if (!editing) {
    if (tags.length === 0) return <p className="text-sm text-zinc-600 italic">None listed</p>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">{t}</span>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded-full">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="text-zinc-400 hover:text-zinc-100">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Type and press Enter"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button type="button" onClick={add} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-100">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-zinc-800 text-zinc-300",
  Applied: "bg-blue-900/50 text-blue-300",
  "Recruiter Screen": "bg-yellow-900/50 text-yellow-300",
  Technical: "bg-orange-900/50 text-orange-300",
  "Final Interview": "bg-purple-900/50 text-purple-300",
  Offer: "bg-green-900/50 text-green-300",
  Rejected: "bg-red-900/50 text-red-300",
};

const JOB_TYPE_COLORS: Record<string, string> = {
  Internship: "bg-sky-900/50 text-sky-300",
  "Student Job": "bg-teal-900/50 text-teal-300",
  "Part-time": "bg-violet-900/50 text-violet-300",
  "Full-time": "bg-zinc-800 text-zinc-300",
};

function ResearchBlock({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: "indigo" | "yellow" | "green" }) {
  const border = { indigo: "border-indigo-900/50", yellow: "border-yellow-900/50", green: "border-green-900/50" }[color];
  const dot = { indigo: "bg-indigo-500", yellow: "bg-yellow-500", green: "bg-green-500" }[color];
  return (
    <div className={`border ${border} rounded-lg p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
            <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExpectedQuestionsBlock({ items }: { items: ExpectedQuestion[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="border border-orange-900/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <HelpCircle size={14} className="text-orange-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Questions You May Be Asked</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="border border-zinc-800 rounded-md overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-zinc-800/50 transition-colors"
            >
              <span className="text-sm text-zinc-200">{item.question}</span>
              <span className="text-zinc-600 text-xs shrink-0 mt-0.5">{open === i ? "▲" : "▼"}</span>
            </button>
            {open === i && (
              <div className="px-3 pb-3 pt-1 bg-zinc-900/50">
                <p className="text-xs text-orange-300/80 flex gap-2">
                  <span className="shrink-0 font-semibold">Tip:</span>
                  {item.tip}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ApplicationDetail({ app }: { app: App }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [researching, setResearching] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [focus, setFocus] = useState("");
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryResearch | null>(() => {
    if (!app.salaryResearch) return null;
    try { return JSON.parse(app.salaryResearch); } catch { return null; }
  });
  const [research, setResearch] = useState<ResearchData | null>(() => {
    if (!app.companyResearch) return null;
    try { return JSON.parse(app.companyResearch); } catch { return null; }
  });

  const [form, setForm] = useState({
    companyName: app.companyName,
    companyWebsite: app.companyWebsite ?? "",
    industry: app.industry ?? "",
    jobTitle: app.jobTitle,
    jobUrl: app.jobUrl ?? "",
    locationType: app.locationType,
    location: app.location ?? "",
    jobType: app.jobType ?? "Full-time",
    status: app.status,
    salaryRange: app.salaryRange ?? "",
    whatTheyExpect: parseJsonArray(app.whatTheyExpect),
    whatIExpect: parseJsonArray(app.whatIExpect),
    whyIApplied: app.whyIApplied ?? "",
    interviewNotes: app.interviewNotes ?? "",
    vibeCheck: app.vibeCheck ?? "",
  });

  function set(field: string, value: string | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSalaryResearch() {
    setSalaryLoading(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/salary`, { method: "POST" });
      if (res.ok) setSalaryData(await res.json());
    } finally {
      setSalaryLoading(false);
    }
  }

  async function handleResearch() {
    setResearching(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus }),
      });
      if (res.ok) setResearch(await res.json());
    } finally {
      setResearching(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Save failed (${res.status})`);
      }
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${app.jobTitle}" at ${app.companyName}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
    router.push("/");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[form.status] ?? "bg-zinc-800 text-zinc-300"}`}>
              {form.status}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${JOB_TYPE_COLORS[form.jobType] ?? "bg-zinc-800 text-zinc-300"}`}>
              {form.jobType}
            </span>
            <span className="text-xs text-zinc-500">{form.locationType}</span>
            {form.salaryRange && <span className="text-xs text-zinc-500">{form.salaryRange}</span>}
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest pt-1">{form.companyName}</p>
          <h1 className="text-2xl font-semibold text-zinc-100">{form.jobTitle}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-6">
          {editing ? (
            <>
              {saveError && <p className="text-xs text-red-400 max-w-[160px] text-right">{saveError}</p>}
              <button onClick={() => { setEditing(false); setSaveError(""); }} className="text-sm text-zinc-400 hover:text-zinc-100 px-3 py-1.5 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-md transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-md transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 border border-zinc-700 hover:border-red-800 px-3 py-1.5 rounded-md transition-colors"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Company & Role */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Company & Role</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Name">
            {editing ? <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className={inputCls} />
              : <p className="text-sm text-zinc-200">{form.companyName}</p>}
          </Field>
          <Field label="Industry">
            {editing ? <input value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="—" className={inputCls} />
              : <p className="text-sm text-zinc-200">{form.industry || <span className="text-zinc-600">—</span>}</p>}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Job Title">
            {editing ? <input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} className={inputCls} />
              : <p className="text-sm text-zinc-200">{form.jobTitle}</p>}
          </Field>
          <Field label="Salary Range">
            {editing ? <input value={form.salaryRange} onChange={(e) => set("salaryRange", e.target.value)} placeholder="—" className={inputCls} />
              : <p className="text-sm text-zinc-200">{form.salaryRange || <span className="text-zinc-600">—</span>}</p>}
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Job Type">
            {editing ? (
              <select value={form.jobType} onChange={(e) => set("jobType", e.target.value)} className={inputCls}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            ) : <p className="text-sm text-zinc-200">{form.jobType}</p>}
          </Field>
          <Field label="Status">
            {editing ? (
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {JOB_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : <p className="text-sm text-zinc-200">{form.status}</p>}
          </Field>
          <Field label="Work Arrangement">
            {editing ? (
              <select value={form.locationType} onChange={(e) => set("locationType", e.target.value)} className={inputCls}>
                {LOCATION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            ) : <p className="text-sm text-zinc-200">{form.locationType}</p>}
          </Field>
        </div>
        <Field label="Location (City, Country)">
          {editing ? (
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Leuven, Belgium" className={inputCls} />
          ) : <p className="text-sm text-zinc-200">{form.location || <span className="text-zinc-600">—</span>}</p>}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company Website">
            {editing ? (
              <input value={form.companyWebsite} onChange={(e) => set("companyWebsite", e.target.value)} type="url" placeholder="—" className={inputCls} />
            ) : form.companyWebsite ? (
              <a href={form.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                {form.companyWebsite} <ExternalLink size={12} />
              </a>
            ) : <p className="text-sm text-zinc-600">—</p>}
          </Field>
          <Field label="Job Posting URL">
            {editing ? (
              <input value={form.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} type="url" placeholder="—" className={inputCls} />
            ) : form.jobUrl ? (
              <a href={form.jobUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                View posting <ExternalLink size={12} />
              </a>
            ) : <p className="text-sm text-zinc-600">—</p>}
          </Field>
        </div>
      </section>

      {/* Expectations */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Expectations</h2>
        <Field label="What They Expect">
          <TagList tags={form.whatTheyExpect} onChange={(t) => set("whatTheyExpect", t)} editing={editing} />
        </Field>
        <Field label="What I Expect">
          <TagList tags={form.whatIExpect} onChange={(t) => set("whatIExpect", t)} editing={editing} />
        </Field>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Notes</h2>
        <Field label="Why I Applied">
          {editing ? (
            <textarea value={form.whyIApplied} onChange={(e) => set("whyIApplied", e.target.value)} rows={3} className={inputCls + " resize-y"} />
          ) : (
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{form.whyIApplied || <span className="text-zinc-600 italic">Nothing written yet.</span>}</p>
          )}
        </Field>
        <Field label="Vibe Check">
          {editing ? (
            <textarea value={form.vibeCheck} onChange={(e) => set("vibeCheck", e.target.value)} rows={3} className={inputCls + " resize-y"} />
          ) : (
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{form.vibeCheck || <span className="text-zinc-600 italic">No vibe check yet.</span>}</p>
          )}
        </Field>
      </section>

      {/* Salary Research */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Salary Research</h2>
            {!form.salaryRange && (
              <span className="text-xs bg-yellow-900/40 text-yellow-300 px-2 py-0.5 rounded-full">No salary listed</span>
            )}
          </div>
          <button
            onClick={handleSalaryResearch}
            disabled={salaryLoading}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
          >
            {salaryLoading ? (
              <><Loader2 size={13} className="animate-spin" /> Researching…</>
            ) : salaryData ? (
              <><RefreshCw size={13} /> Refresh</>
            ) : (
              <><BadgeDollarSign size={13} /> Research Salary</>
            )}
          </button>
        </div>

        {!salaryData && !salaryLoading && (
          <div className="border border-dashed border-zinc-800 rounded-lg p-5 text-center space-y-1.5">
            <BadgeDollarSign size={20} className="text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-500">
              {form.salaryRange
                ? `Salary listed as "${form.salaryRange}". Click Research Salary for a detailed breakdown or market comparison.`
                : "No salary listed — click Research Salary to estimate based on official scales or market rates."}
            </p>
          </div>
        )}

        {salaryLoading && (
          <div className="border border-dashed border-zinc-800 rounded-lg p-5 text-center">
            <Loader2 size={20} className="text-emerald-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Researching compensation…</p>
          </div>
        )}

        {salaryData && !salaryLoading && (
          <div className="border border-emerald-900/40 rounded-lg p-4 space-y-4">
            {/* Headline */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xl font-semibold text-emerald-300">{salaryData.estimate}</p>
                {salaryData.netEstimate && (
                  <p className="text-sm text-zinc-400 mt-0.5">≈ {salaryData.netEstimate} net</p>
                )}
                <p className="text-xs text-zinc-500 mt-0.5">{salaryData.basis}</p>
              </div>
              {salaryData.scaleReference && (
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md shrink-0 self-start">
                  {salaryData.scaleReference}
                </span>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">How this was calculated</p>
              <ul className="space-y-1.5">
                {salaryData.breakdown.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                    <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location adjustment */}
            {salaryData.locationAdjustment && (
              <div className="bg-zinc-900 rounded-md px-3 py-2.5">
                <p className="text-xs text-zinc-400"><span className="font-semibold text-zinc-300">Location: </span>{salaryData.locationAdjustment}</p>
              </div>
            )}

            {/* Benefits */}
            {salaryData.benefitsToFactor?.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Common benefits for this role</p>
                <div className="flex flex-wrap gap-1.5">
                  {salaryData.benefitsToFactor.map((b, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Pay transparency note */}
            {salaryData.payTransparencyNote && (
              <div className="bg-blue-950/40 border border-blue-900/40 rounded-md px-3 py-2.5">
                <p className="text-xs text-blue-300"><span className="font-semibold">Pay Transparency (EU 2026): </span>{salaryData.payTransparencyNote}</p>
              </div>
            )}

            {/* Notes */}
            {salaryData.notes && (
              <div className="bg-zinc-900 rounded-md px-3 py-2.5">
                <p className="text-xs text-zinc-400"><span className="font-semibold text-zinc-300">Note: </span>{salaryData.notes}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Company Research */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Interview Preparation</h2>
        </div>

        {/* Focus input */}
        <div className="flex gap-2">
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder={`Focus on… e.g. "technical stack", "team culture", "internship learning goals"`}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleResearch}
            disabled={researching}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors shrink-0"
          >
            {researching ? (
              <><Loader2 size={14} className="animate-spin" /> Generating…</>
            ) : research ? (
              <><RefreshCw size={14} /> Regenerate</>
            ) : (
              <><Telescope size={14} /> Research</>
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-600 -mt-2">
          Optionally describe what to focus on, then click Research. Uses job type ({form.jobType}) to tailor the output.
        </p>

        {!research && !researching && (
          <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center space-y-2">
            <Sparkles size={20} className="text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-500">
              Generate tailored interview prep for <span className="text-zinc-300">{app.companyName}</span> — questions to ask, company insights, talking points, and questions you may be asked.
            </p>
          </div>
        )}

        {researching && (
          <div className="border border-dashed border-zinc-800 rounded-lg p-6 text-center">
            <Loader2 size={20} className="text-indigo-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Generating research brief…</p>
          </div>
        )}

        {research && !researching && (
          <div className="space-y-4">
            <ResearchBlock icon={<MessageSquare size={14} className="text-indigo-400" />} title="Questions to Ask" items={research.questions} color="indigo" />
            <ResearchBlock icon={<Lightbulb size={14} className="text-yellow-400" />} title="Company Insights" items={research.insights} color="yellow" />
            <ResearchBlock icon={<Sparkles size={14} className="text-green-400" />} title="Talking Points" items={research.talkingPoints} color="green" />
            {research.expectedQuestions?.length > 0 && (
              <ExpectedQuestionsBlock items={research.expectedQuestions} />
            )}
          </div>
        )}
      </section>

      {/* Interview Scratchpad */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
          Interview Scratchpad
        </h2>
        <textarea
          value={form.interviewNotes}
          onChange={(e) => set("interviewNotes", e.target.value)}
          onBlur={async () => {
            await fetch(`/api/applications/${app.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ interviewNotes: form.interviewNotes }),
            });
          }}
          placeholder="Notes, answers to prep, things to research before the interview…"
          rows={8}
          className={inputCls + " resize-y font-mono text-xs"}
        />
        <p className="text-xs text-zinc-600">Auto-saves when you click away.</p>
      </section>
    </div>
  );
}
