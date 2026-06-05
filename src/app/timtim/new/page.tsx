import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TIMTIM_CATEGORIES, TIMTIM_ROLES } from "@/lib/timtim";
import { Shield, Info, Plus, X } from "lucide-react";

export const metadata = {
  title: "Post a project",
  description: "Post a project on TimTim and start building your team.",
};

export const dynamic = "force-dynamic";


export default function NewTimTimProjectPage() {
  return (
    <div className="container-page py-12 max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">TimTim</p>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Post a project</h1>
        <p className="text-fg-muted mt-2 text-sm max-w-xl">
          Tell people what you&apos;re building and who you need. You can edit everything later.
        </p>
      </div>

      {/* Scaffold notice */}
      <Card className="mb-6 border-warning/20 bg-warning/[0.04]">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Scaffold preview</p>
            <p className="text-xs text-fg-muted mt-1 leading-relaxed">
              This is the form layout for the project posting flow. Saving and publishing will activate once the
              TimTim data model and server actions are in place.
            </p>
          </div>
        </CardContent>
      </Card>

      <form className="space-y-6">
        {/* Basics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basics</CardTitle>
            <CardDescription>Give your project a clear, scannable name and one-line summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Project title *</Label>
              <Input id="title" name="title" placeholder="e.g. Campus food delivery, in 36 hours" maxLength={80} disabled />
              <p className="text-[11px] text-fg-dim">80 characters max.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="summary">One-line summary *</Label>
              <Input
                id="summary"
                name="summary"
                placeholder="A 2-person team building a Bangla speech-to-text tool for classrooms."
                maxLength={140}
                disabled
              />
              <p className="text-[11px] text-fg-dim">140 characters max. Shown on listing cards.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Select id="category" name="category" disabled defaultValue="">
                <option value="">Select a category</option>
                {TIMTIM_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>What are you building, and what&apos;s the goal? Be specific.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                placeholder="What problem are you solving? What's the scope? What tech / approach are you using? What does 'done' look like?"
                maxLength={4000}
                disabled
              />
              <p className="text-[11px] text-fg-dim">Markdown supported. 4000 characters max.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Team capacity *</Label>
                <Input id="capacity" name="capacity" type="number" min={2} max={20} defaultValue={4} disabled />
                <p className="text-[11px] text-fg-dim">Total people you want on the team, including you.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input id="deadline" name="deadline" type="date" disabled />
                <p className="text-[11px] text-fg-dim">If you have a hard date — hackathon, submission, etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles needed</CardTitle>
            <CardDescription>Pick the skills and roles you&apos;re looking for. Applicants can see this.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TIMTIM_ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-line bg-bg-soft text-fg-muted opacity-60 cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" /> {r.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-fg-dim mt-3">
              Role selection will become interactive when posting is enabled.
            </p>
          </CardContent>
        </Card>

        {/* Trust note */}
        <Card className="border-accent/20 bg-accent/[0.02]">
          <CardContent className="py-4 flex items-start gap-3">
            <Shield className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Verified-only</p>
              <p className="text-xs text-fg-muted mt-1 leading-relaxed">
                Only verified Gonix members will be able to view full details and apply. Your project is associated
                with your verified profile.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-bg/80 backdrop-blur-sm p-3 rounded-lg border border-line">
          <div className="flex items-center gap-2">
            <Badge variant="muted">Draft</Badge>
            <span className="text-xs text-fg-dim">Auto-save will arrive with the data model.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="md" disabled>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" size="md" disabled>
              Publish project
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
