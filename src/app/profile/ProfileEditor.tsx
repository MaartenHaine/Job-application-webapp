"use client";

import { useState } from "react";
import { Sparkles, Loader2, Plus, X, Save, CheckCircle } from "lucide-react";

type WorkExperience = { title: string; company: string; from: string; to: string | null; current: boolean; description: string | null };
type Education = { degree: string; field: string; institution: string; year: string | null };
type Language = { language: string; level: string };

type Profile = {
  name: string;
  email: string;
  currentTitle: string;
  location: string;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: Language[];
};

const emptyProfile: Profile = {
  name: "", email: "", currentTitle: "", location: "", summary: "",
  workExperience: [], education: [], skills: [], languages: [],
};

function parseJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

const inputCls = "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelCls = "block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5";

export default function ProfileEditor({ profile }: { profile: Record<string, unknown> | null }) {
  const [form, setForm] = useState<Profile>({
    name: (profile?.name as string) ?? "",
    email: (profile?.email as string) ?? "",
    currentTitle: (profile?.currentTitle as string) ?? "",
    location: (profile?.location as string) ?? "",
    summary: (profile?.summary as string) ?? "",
    workExperience: parseJson<WorkExperience[]>(profile?.workExperience as string, []),
    education: parseJson<Education[]>(profile?.education as string, []),
    skills: parseJson<string[]>(profile?.skills as string, []),
    languages: parseJson<Language[]>(profile?.languages as string, []),
  });

  const [rawCv, setRawCv] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [cvOpen, setCvOpen] = useState(!profile);

  function setField<K extends keyof Profile>(key: K, val: Profile[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function handleParseCV() {
    if (!rawCv.trim()) return;
    setParsing(true);
    setParseError("");
    try {
      const res = await fetch("/api/profile/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawCv }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const parsed = await res.json();
      setForm({
        name: parsed.name ?? "",
        email: parsed.email ?? "",
        currentTitle: parsed.currentTitle ?? "",
        location: parsed.location ?? "",
        summary: parsed.summary ?? "",
        workExperience: parsed.workExperience ?? [],
        education: parsed.education ?? [],
        skills: parsed.skills ?? [],
        languages: parsed.languages ?? [],
      });
      setCvOpen(false);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  function addSkill() {
    const v = skillInput.trim();
    if (v && !form.skills.includes(v)) setField("skills", [...form.skills, v]);
    setSkillInput("");
  }

  function addWorkExp() {
    setField("workExperience", [...form.workExperience, { title: "", company: "", from: "", to: null, current: false, description: "" }]);
  }

  function updateWork(i: number, key: keyof WorkExperience, val: string | boolean | null) {
    const updated = form.workExperience.map((w, idx) => idx === i ? { ...w, [key]: val } : w);
    setField("workExperience", updated);
  }

  function removeWork(i: number) {
    setField("workExperience", form.workExperience.filter((_, idx) => idx !== i));
  }

  function addEducation() {
    setField("education", [...form.education, { degree: "", field: "", institution: "", year: "" }]);
  }

  function updateEdu(i: number, key: keyof Education, val: string) {
    const updated = form.education.map((e, idx) => idx === i ? { ...e, [key]: val } : e);
    setField("education", updated);
  }

  function removeEdu(i: number) {
    setField("education", form.education.filter((_, idx) => idx !== i));
  }

  function addLanguage() {
    setField("languages", [...form.languages, { language: "", level: "" }]);
  }

  function updateLang(i: number, key: keyof Language, val: string) {
    const updated = form.languages.map((l, idx) => idx === i ? { ...l, [key]: val } : l);
    setField("languages", updated);
  }

  function removeLang(i: number) {
    setField("languages", form.languages.filter((_, idx) => idx !== i));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Your Profile</h1>
          <p className="text-sm text-zinc-500 mt-1">Used to personalise salary estimates and interview prep.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? "Saved" : "Save Profile"}
        </button>
      </div>

      {/* CV Import */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setCvOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
            <Sparkles size={16} />
            Import from CV — paste your CV to auto-fill
          </div>
          <span className="text-zinc-500 text-xs">{cvOpen ? "▲" : "▼"}</span>
        </button>
        {cvOpen && (
          <div className="p-5 space-y-3 bg-zinc-950">
            <textarea
              value={rawCv}
              onChange={e => setRawCv(e.target.value)}
              placeholder="Paste your full CV text here — work experience, education, skills, languages, everything…"
              rows={8}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y font-mono"
            />
            {parseError && <p className="text-sm text-red-400">{parseError}</p>}
            <button
              onClick={handleParseCV}
              disabled={parsing || !rawCv.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              {parsing ? <><Loader2 size={14} className="animate-spin" /> Parsing…</> : <><Sparkles size={14} /> Parse CV</>}
            </button>
          </div>
        )}
      </div>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Basic Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Name</label><input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Your full name" className={inputCls} /></div>
          <div><label className={labelCls}>Email</label><input value={form.email} onChange={e => setField("email", e.target.value)} placeholder="your@email.com" type="email" className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Current / Most Recent Title</label><input value={form.currentTitle} onChange={e => setField("currentTitle", e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} /></div>
          <div><label className={labelCls}>Location</label><input value={form.location} onChange={e => setField("location", e.target.value)} placeholder="e.g. Leuven, Belgium" className={inputCls} /></div>
        </div>
        <div>
          <label className={labelCls}>Professional Summary</label>
          <textarea value={form.summary} onChange={e => setField("summary", e.target.value)} placeholder="A short summary of who you are professionally…" rows={3} className={inputCls + " resize-y"} />
        </div>
      </section>

      {/* Work Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Work Experience</h2>
          <button onClick={addWorkExp} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={13} /> Add</button>
        </div>
        {form.workExperience.length === 0 && <p className="text-sm text-zinc-600 italic">No work experience added yet.</p>}
        <div className="space-y-4">
          {form.workExperience.map((w, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-4 space-y-3 relative">
              <button onClick={() => removeWork(i)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-400"><X size={14} /></button>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Job Title</label><input value={w.title} onChange={e => updateWork(i, "title", e.target.value)} placeholder="Software Engineer" className={inputCls} /></div>
                <div><label className={labelCls}>Company</label><input value={w.company} onChange={e => updateWork(i, "company", e.target.value)} placeholder="Acme Corp" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                <div><label className={labelCls}>From</label><input value={w.from} onChange={e => updateWork(i, "from", e.target.value)} placeholder="Sep 2022" className={inputCls} /></div>
                <div><label className={labelCls}>To</label><input value={w.to ?? ""} onChange={e => updateWork(i, "to", e.target.value || null)} placeholder="Jun 2024" disabled={w.current} className={inputCls + (w.current ? " opacity-40" : "")} /></div>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer pb-2">
                  <input type="checkbox" checked={w.current} onChange={e => { updateWork(i, "current", e.target.checked); if (e.target.checked) updateWork(i, "to", null); }} className="accent-indigo-500" />
                  Current
                </label>
              </div>
              <div><label className={labelCls}>Description</label><textarea value={w.description ?? ""} onChange={e => updateWork(i, "description", e.target.value)} placeholder="Brief summary of responsibilities…" rows={2} className={inputCls + " resize-y"} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Education</h2>
          <button onClick={addEducation} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={13} /> Add</button>
        </div>
        {form.education.length === 0 && <p className="text-sm text-zinc-600 italic">No education added yet.</p>}
        <div className="space-y-3">
          {form.education.map((e, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-4 space-y-3 relative">
              <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-400"><X size={14} /></button>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Degree</label><input value={e.degree} onChange={x => updateEdu(i, "degree", x.target.value)} placeholder="Bachelor of Science" className={inputCls} /></div>
                <div><label className={labelCls}>Field of Study</label><input value={e.field} onChange={x => updateEdu(i, "field", x.target.value)} placeholder="Computer Science" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Institution</label><input value={e.institution} onChange={x => updateEdu(i, "institution", x.target.value)} placeholder="KU Leuven" className={inputCls} /></div>
                <div><label className={labelCls}>Year</label><input value={e.year ?? ""} onChange={x => updateEdu(i, "year", x.target.value)} placeholder="2025" className={inputCls} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Skills</h2>
        <div className="flex flex-wrap gap-1.5">
          {form.skills.map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded-full">
              {s}
              <button onClick={() => setField("skills", form.skills.filter(x => x !== s))} className="text-zinc-400 hover:text-zinc-100"><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <button onClick={addSkill} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-100"><Plus size={16} /></button>
        </div>
      </section>

      {/* Languages */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Languages</h2>
          <button onClick={addLanguage} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={13} /> Add</button>
        </div>
        {form.languages.length === 0 && <p className="text-sm text-zinc-600 italic">No languages added yet.</p>}
        <div className="space-y-2">
          {form.languages.map((l, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input value={l.language} onChange={e => updateLang(i, "language", e.target.value)} placeholder="Dutch" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <input value={l.level} onChange={e => updateLang(i, "level", e.target.value)} placeholder="Native / B2 / Fluent" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <button onClick={() => removeLang(i)} className="text-zinc-600 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
