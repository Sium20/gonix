import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProfileEditForm } from "./form";

export const metadata = { title: "Edit profile" };

export const dynamic = "force-dynamic";


export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/profile");

  const profile = await prisma.profile.findUnique({
    where: { id: (session.user as any).id },
    include: { university: true, department: true },
  });
  if (!profile) redirect("/login");
  if (profile.status !== "verified") redirect("/dashboard");

  const socials = profile.socialLinks ? JSON.parse(profile.socialLinks) : {};

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="font-serif text-2xl md:text-3xl tracking-tight mb-2">Edit profile</h1>
      <p className="text-sm text-fg-muted mb-8">Update what others see in the directory. University, department, and ID numbers can only be changed by an admin.</p>
      <ProfileEditForm
        initial={{
          fullName: profile.fullName,
          bio: profile.bio || "",
          phone: profile.phone || "",
          currentCompany: profile.currentCompany || "",
          currentTitle: profile.currentTitle || "",
          showEmail: profile.showEmail,
          showPhone: profile.showPhone,
          socialLinkedin: socials.linkedin || "",
          socialGithub: socials.github || "",
          universityName: profile.university.name,
          departmentName: profile.department?.name || null,
        }}
      />
    </div>
  );
}
