import { prisma } from "@/lib/prisma";
import ProfileEditor from "./ProfileEditor";

export default async function ProfilePage() {
  const profile = await prisma.userProfile.findUnique({ where: { id: "profile" } });
  return <ProfileEditor profile={profile} />;
}
