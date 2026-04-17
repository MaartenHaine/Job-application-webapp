import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Briefcase } from "lucide-react";
import { JOB_STATUSES } from "@/lib/types";
import KanbanBoard from "@/components/KanbanBoard";

export default async function HomePage() {
  const applications = await prisma.jobApplication.findMany({
    orderBy: { updatedAt: "desc" },
  });

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="p-4 bg-zinc-900 rounded-full">
          <Briefcase size={32} className="text-zinc-500" />
        </div>
        <div>
          <p className="text-zinc-300 font-medium">No applications yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Add your first job application to get started.
          </p>
        </div>
        <Link
          href="/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          + Add Application
        </Link>
      </div>
    );
  }

  // Group by status preserving pipeline order
  const grouped = Object.fromEntries(
    JOB_STATUSES.map((s) => [s, applications.filter((a) => a.status === s)])
  );

  return (
    <div className="px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
        </p>
      </div>
      <KanbanBoard grouped={grouped} />
    </div>
  );
}
