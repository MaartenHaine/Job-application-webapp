"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, X, Plus, AlertTriangle } from "lucide-react";
import { JOB_STATUSES, LOCATION_TYPES, JOB_TYPES, type ParsedJob } from "@/lib/types";

interface FormState {
  companyName: string;
  companyWebsite: string;
  industry: string;
  jobTitle: string;
  jobUrl: string;
  locationType: string;
  jobType: string;
  status: string;
  salaryRange: string;
  whatTheyExpect: string[];
  whatIExpect: string[];
  whyIApplied: string;
  interviewNotes: string;
  vibeCheck: string;
}

const empty: FormState = {
  companyName: "",
  companyWebsite: "",
  industry: "",
  jobTitle: "",
  jobUrl: "",
  locationType: "Remote",
  jobType: "Full-time",
  status: "Draft",
  salaryRange: "",
  whatTheyExpect: [],
  whatIExpect: [],
  whyIApplied: "",
  interviewNotes: "",
  vibeCheck: "",
};

function TagList({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-zinc-400 hover:text-zinc-100"
            >
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
        <button
          type="button"
          onClick={add}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function NewApplicationForm() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(true);

  function set(field: keyof FormState, value: string | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Parse failed");
      }
      const parsed: ParsedJob = await res.json();
      setForm({
        companyName: parsed.companyName ?? "",
        companyWebsite: parsed.companyWebsite ?? "",
        industry: parsed.industry ?? "",
        jobTitle: parsed.jobTitle ?? "",
        jobUrl: parsed.jobUrl ?? "",
        locationType: parsed.locationType ?? "Remote",
        jobType: "Full-time",
        status: "Draft",
        salaryRange: parsed.salaryRange ?? "",
        whatTheyExpect: parsed.whatTheyExpect ?? [],
        whatIExpect: parsed.whatIExpect ?? [],
        whyIApplied: parsed.whyIApplied ?? "",
        interviewNotes: "",
        vibeCheck: parsed.vibeCheck ?? "",
      });
      setImportOpen(false);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      router.push(`/applications/${saved.id}`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">New Application</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Paste a job description to auto-fill the form, or fill it in manually.
        </p>
      </div>

      {/* Magic Import */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setImportOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
            <Sparkles size={16} />
            Magic Import — paste a job description
          </div>
          <span className="text-zinc-500 text-xs">{importOpen ? "▲" : "▼"}</span>
        </button>

        {importOpen && (
          <div className="p-5 space-y-3 bg-zinc-950">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full job description here — title, company, requirements, salary, perks, everything..."
              rows={8}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y font-mono"
            />
            {parseError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> {parseError}
              </p>
            )}
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing || !rawText.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {parsing ? (
                <><Loader2 size={15} className="animate-spin" /> Parsing…</>
              ) : (
                <><Sparkles size={15} /> Parse with Gemini</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
            Company
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name *">
              <input
                required
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Acme Corp"
                className={inputCls}
              />
            </Field>
            <Field label="Industry">
              <input
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="SaaS / Fintech / etc."
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Company Website">
            <input
              value={form.companyWebsite}
              onChange={(e) => set("companyWebsite", e.target.value)}
              placeholder="https://example.com"
              type="url"
              className={inputCls}
            />
          </Field>
        </section>

        {/* Role */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
            Role
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Job Title *">
              <input
                required
                value={form.jobTitle}
                onChange={(e) => set("jobTitle", e.target.value)}
                placeholder="Senior Frontend Engineer"
                className={inputCls}
              />
            </Field>
            <Field label="Salary Range">
              <input
                value={form.salaryRange}
                onChange={(e) => set("salaryRange", e.target.value)}
                placeholder="$80k – $100k"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Job Posting URL">
            <input
              value={form.jobUrl}
              onChange={(e) => set("jobUrl", e.target.value)}
              placeholder="https://jobs.example.com/posting/123"
              type="url"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Job Type">
              <select
                value={form.jobType}
                onChange={(e) => set("jobType", e.target.value)}
                className={inputCls}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Location Type">
              <select
                value={form.locationType}
                onChange={(e) => set("locationType", e.target.value)}
                className={inputCls}
              >
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* Expectations */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
            Expectations
          </h2>
          <Field label="What They Expect (skills, requirements)">
            <TagList
              tags={form.whatTheyExpect}
              onChange={(t) => set("whatTheyExpect", t)}
            />
          </Field>
          <Field label="What I Expect (benefits, growth, perks)">
            <TagList
              tags={form.whatIExpect}
              onChange={(t) => set("whatIExpect", t)}
            />
          </Field>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
            Notes
          </h2>
          <Field label="Why I Applied">
            <textarea
              value={form.whyIApplied}
              onChange={(e) => set("whyIApplied", e.target.value)}
              placeholder="What drew me to this role…"
              rows={3}
              className={inputCls + " resize-y"}
            />
          </Field>
          <Field label="Vibe Check">
            <textarea
              value={form.vibeCheck}
              onChange={(e) => set("vibeCheck", e.target.value)}
              placeholder="Red flags, buzzwords, gut feel…"
              rows={3}
              className={inputCls + " resize-y"}
            />
          </Field>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-md transition-colors"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Save Application
          </button>
        </div>
      </form>
    </div>
  );
}
