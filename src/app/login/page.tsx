"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Signed in");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Gonix.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            <FieldError>{errors.email}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
            <FieldError>{errors.password}</FieldError>
          </div>
          <Button type="submit" loading={loading} className="w-full">Sign in</Button>
        </form>
        <p className="text-sm text-fg-muted text-center mt-6">
          New here? <Link href="/register" className="text-accent hover:underline">Get verified</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export const dynamic = "force-dynamic";


export default function LoginPage() {
  return (
    <div className="container-page py-20 max-w-md mx-auto">
      <Suspense fallback={<div className="h-96 rounded-xl bg-bg-soft animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
