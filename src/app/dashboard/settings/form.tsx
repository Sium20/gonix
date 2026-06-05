"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePassword, deleteOwnAccount } from "../actions";
import toast from "react-hot-toast";

export function SettingsForm({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your login email is private by default</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(fd) => startTransition(async () => {
              const r = await changePassword(null, fd);
              if (r?.error) toast.error(r.error);
              else if (r?.success) { toast.success(r.success); (document.getElementById("pw-form") as HTMLFormElement).reset(); }
            })}
            id="pw-form"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input name="newPassword" type="password" required minLength={8} />
            </div>
            <Button type="submit" loading={pending}>Change password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="text-base text-danger">Danger zone</CardTitle>
          <CardDescription>Deleting your account will suspend your profile and mark it for permanent deletion. Public data is removed; audit logs are retained without PII.</CardDescription>
        </CardHeader>
        <CardContent>
          {confirming ? (
            <div className="space-y-3">
              <p className="text-sm text-fg-muted">Are you sure? This cannot be undone from your side.</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={async () => {
                    const r = await deleteOwnAccount();
                    if (r?.error) toast.error(r.error);
                    else {
                      toast.success("Account scheduled for deletion");
                      signOut({ callbackUrl: "/" });
                    }
                  }}
                >
                  Yes, delete my account
                </Button>
                <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirming(true)}>Delete account</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
