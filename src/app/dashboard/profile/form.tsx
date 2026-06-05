"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { updateProfile } from "../actions";

type Initial = {
  fullName: string;
  bio: string;
  phone: string;
  currentCompany: string;
  currentTitle: string;
  showEmail: boolean;
  showPhone: boolean;
  socialLinkedin: string;
  socialGithub: string;
  universityName: string;
  departmentName: string | null;
};

export function ProfileEditForm({ initial }: { initial: Initial }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form action={(fd) => startTransition(async () => {
      const r = await updateProfile(null, fd);
      if (r?.error) toast.error(r.error);
      else if (r?.success) {
        toast.success(r.success);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    })} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
          <CardDescription>Your name and how it appears in the directory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input name="fullName" defaultValue={initial.fullName} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>University</Label>
              <Input value={initial.universityName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={initial.departmentName || "—"} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea name="bio" defaultValue={initial.bio} maxLength={500} />
          </div>
          {(initial.currentCompany !== "" || initial.currentTitle !== "") || true ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current company (alumni)</Label>
                <Input name="currentCompany" defaultValue={initial.currentCompany} />
              </div>
              <div className="space-y-2">
                <Label>Current title (alumni)</Label>
                <Input name="currentTitle" defaultValue={initial.currentTitle} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input name="socialLinkedin" type="url" defaultValue={initial.socialLinkedin} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <Label>GitHub</Label>
            <Input name="socialGithub" type="url" defaultValue={initial.socialGithub} placeholder="https://github.com/..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
          <CardDescription>Choose what&apos;s visible to other users. Only verified profiles can see your contact info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-md border border-line hover:bg-bg-soft cursor-pointer">
            <div>
              <p className="text-sm font-medium">Show email</p>
              <p className="text-xs text-fg-muted">Other verified users will see your email on your profile</p>
            </div>
            <input type="checkbox" name="showEmail" defaultChecked={initial.showEmail} className="h-4 w-4 accent-accent" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-md border border-line hover:bg-bg-soft cursor-pointer">
            <div>
              <p className="text-sm font-medium">Show phone</p>
              <p className="text-xs text-fg-muted">Other verified users will see your phone on your profile</p>
            </div>
            <input type="checkbox" name="showPhone" defaultChecked={initial.showPhone} className="h-4 w-4 accent-accent" />
          </label>
          <div className="space-y-2 pt-2">
            <Label>Phone (private to you, used for password reset)</Label>
            <Input name="phone" type="tel" defaultValue={initial.phone} placeholder="01712345678" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved ? <span className="text-xs text-emerald-700 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Saved</span> : null}
        <Button type="submit" loading={pending}>Save changes</Button>
      </div>
    </form>
  );
}
