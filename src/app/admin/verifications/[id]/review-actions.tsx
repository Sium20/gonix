"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Check, X, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { decideVerification, requestMoreInfo } from "../actions";

export function ReviewActions({ requestId, profileName }: { requestId: string; profileName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"approve" | "reject" | "info" | null>(null);
  const [notes, setNotes] = useState("");

  function submit(decision: "approved" | "rejected") {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("requestId", requestId);
      fd.append("decision", decision);
      if (notes) fd.append("notes", notes);
      const r = await decideVerification(null, fd);
      if (r?.error) toast.error(r.error);
      else {
        toast.success(`Marked ${decision}`);
        router.push("/admin/verifications");
        router.refresh();
      }
    });
  }

  function sendInfoRequest() {
    if (!notes.trim()) {
      toast.error("Add a message asking for what you need");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.append("requestId", requestId);
      fd.append("message", notes);
      const r = await requestMoreInfo(null, fd);
      if (r?.error) toast.error(r.error);
      else {
        toast.success("Info requested email sent");
        setMode(null);
        setNotes("");
      }
    });
  }

  if (mode === "info") {
    return (
      <Card className="border-warning/30 bg-warning/[0.03]">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-amber-700">Request more info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-fg-muted">Send {profileName} an email asking for the missing piece. Their request will stay pending.</p>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. The back of your ID card is unclear. Please re-upload." />
          <div className="flex gap-2">
            <Button onClick={sendInfoRequest} loading={pending}>Send</Button>
            <Button variant="outline" onClick={() => { setMode(null); setNotes(""); }}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode) {
    return (
      <Card className={mode === "approve" ? "border-success/30 bg-success/[0.03]" : "border-danger/30 bg-danger/[0.03]"}>
        <CardHeader>
          <CardTitle className={`text-sm uppercase tracking-wider ${mode === "approve" ? "text-emerald-700" : "text-danger"}`}>
            {mode === "approve" ? "Approve" : "Reject"} verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-fg-muted">
            {mode === "approve"
              ? `${profileName} will be notified and their profile will go live immediately.`
              : `${profileName} will be notified with your reason. They may re-submit.`}
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={mode === "approve" ? "Optional note (private to admin team)" : "Reason (sent to user)"}
          />
          <div className="flex gap-2">
            <Button
              variant={mode === "approve" ? "primary" : "danger"}
              onClick={() => submit(mode === "approve" ? "approved" : "rejected")}
              loading={pending}
            >
              {mode === "approve" ? <><Check className="h-4 w-4" /> Confirm approve</> : <><X className="h-4 w-4" /> Confirm reject</>}
            </Button>
            <Button variant="outline" onClick={() => { setMode(null); setNotes(""); }}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wider text-fg-muted">Decision</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => setMode("approve")}>
            <Check className="h-4 w-4" /> Approve
          </Button>
          <Button variant="danger" onClick={() => setMode("reject")}>
            <X className="h-4 w-4" /> Reject
          </Button>
          <Button variant="outline" onClick={() => setMode("info")}>
            <MessageCircle className="h-4 w-4" /> Ask
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
