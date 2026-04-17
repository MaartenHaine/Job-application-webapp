"use client";

import Link from "next/link";
import { MapPin, DollarSign, Building2 } from "lucide-react";
import { JOB_STATUSES, type JobStatus } from "@/lib/types";

type App = {
  id: string;
  companyName: string;
  jobTitle: string;
  locationType: string;
  salaryRange: string | null;
  industry: string | null;
  updatedAt: Date | string;
};

const STATUS_COLORS: Record<JobStatus, string> = {
  Draft: "text-zinc-400 bg-zinc-800/60",
  Applied: "text-blue-300 bg-blue-900/40",
  "Recruiter Screen": "text-yellow-300 bg-yellow-900/40",
  Technical: "text-orange-300 bg-orange-900/40",
  "Final Interview": "text-purple-300 bg-purple-900/40",
  Offer: "text-green-300 bg-green-900/40",
  Rejected: "text-red-300 bg-red-900/40",
};

const STATUS_HEADER: Record<JobStatus, string> = {
  Draft: "border-zinc-700",
  Applied: "border-blue-700",
  "Recruiter Screen": "border-yellow-700",
  Technical: "border-orange-700",
  "Final Interview": "border-purple-700",
  Offer: "border-green-700",
  Rejected: "border-red-800",
};

function JobCard({ app }: { app: App }) {
  return (
    <Link
      href={`/applications/${app.id}`}
      className="block bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3.5 space-y-2 transition-colors group"
    >
      <div>
        <p className="text-sm font-medium text-zinc-100 group-hover:text-white leading-snug">
          {app.jobTitle}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
          <Building2 size={11} />
          {app.companyName}
          {app.industry ? ` · ${app.industry}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
          <MapPin size={11} />
          {app.locationType}
        </span>
        {app.salaryRange && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
            <DollarSign size={11} />
            {app.salaryRange}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function KanbanBoard({
  grouped,
}: {
  grouped: Record<string, App[]>;
}) {
  const activeStatuses = JOB_STATUSES.filter(
    (s) => s !== "Rejected" && s !== "Draft"
  );
  const showRejected = (grouped["Rejected"] ?? []).length > 0;
  const showDraft = (grouped["Draft"] ?? []).length > 0;

  return (
    <div className="space-y-8">
      {/* Pipeline columns */}
      <div className="grid grid-cols-[repeat(5,minmax(180px,1fr))] gap-3 overflow-x-auto pb-2">
        {activeStatuses.map((status) => {
          const cards = grouped[status] ?? [];
          return (
            <div key={status} className="space-y-2 min-w-0">
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${STATUS_HEADER[status]}`}
              >
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}
                >
                  {status}
                </span>
                <span className="text-xs text-zinc-600">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((app) => (
                  <JobCard key={app.id} app={app} />
                ))}
                {cards.length === 0 && (
                  <p className="text-xs text-zinc-700 px-1 py-3 text-center border border-dashed border-zinc-800 rounded-lg">
                    empty
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Draft & Rejected as flat rows */}
      {(showDraft || showRejected) && (
        <div className="space-y-4">
          {showDraft && (
            <CollapsibleRow status="Draft" cards={grouped["Draft"] ?? []} />
          )}
          {showRejected && (
            <CollapsibleRow
              status="Rejected"
              cards={grouped["Rejected"] ?? []}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CollapsibleRow({ status, cards }: { status: JobStatus; cards: App[] }) {
  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-2 border-b pb-1.5 ${STATUS_HEADER[status]}`}
      >
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}
        >
          {status}
        </span>
        <span className="text-xs text-zinc-600">{cards.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {cards.map((app) => (
          <JobCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
