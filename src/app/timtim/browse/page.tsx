import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, SlidersHorizontal, Users, Wrench } from "lucide-react";

export const metadata = {
  title: "Browse projects",
  description: "Browse open projects on TimTim and find a team to work with.",
};

export const dynamic = "force-dynamic";


export default function BrowseTimTimPage() {
  return (
    <div className="container-page py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">TimTim</p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Browse projects</h1>
          <p className="text-fg-muted mt-1 text-sm">Find a team to build, research, or ship something with.</p>
        </div>
        <Link href="/timtim/new">
          <Button>
            <Plus className="h-4 w-4" /> Post a project
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <Card className="mb-8">
        <CardContent className="py-4">
          <div className="grid sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6 space-y-1.5">
              <Label htmlFor="q">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-dim" />
                <Input id="q" placeholder="Search by title, skill, or keyword" className="pl-9" disabled />
              </div>
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select id="category" disabled defaultValue="">
                <option value="">All categories</option>
              </Select>
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" disabled defaultValue="">
                <option value="">All statuses</option>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-fg-dim mt-3 flex items-center gap-1.5">
            <SlidersHorizontal className="h-3 w-3" /> Filters will activate once projects are posted.
          </p>
        </CardContent>
      </Card>

      {/* Empty state */}
      <Card>
        <CardContent className="py-16 text-center">
          <div className="h-14 w-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle>No projects yet</CardTitle>
          <CardDescription className="mt-2 max-w-md mx-auto">
            TimTim just launched. Be the first to post a project and start building your team.
          </CardDescription>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/timtim/new">
              <Button>
                <Plus className="h-4 w-4" /> Post a project
              </Button>
            </Link>
            <Link href="/timtim">
              <Button variant="outline">
                <Wrench className="h-4 w-4" /> How it works
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-fg-dim mt-6">
            <Badge variant="muted">Tip</Badge>{" "}
            Projects you post will appear here and on your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
