import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ApplicationDetail from "./ApplicationDetail";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await prisma.jobApplication.findUnique({ where: { id } });
  if (!app) notFound();

  return <ApplicationDetail app={app} />;
}
