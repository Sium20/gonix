import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  UserPlus,
  Rocket,
  Sparkles,
  Shield,
  ArrowRight,
  Search,
  Plus,
  Trophy,
  FlaskConical,
  Code2,
  GraduationCap,
  Megaphone,
  Wrench,
} from "lucide-react";

export const metadata = {
  title: "TimTim",
  description:
    "Find your own team for your work. TimTim is where verified students, teachers, and alumni find collaborators for hackathons, research, side projects, and more.",
};

const STEPS = [
  {
    icon: Plus,
    title: "Post a project",
    body: "Describe what you're building, the roles you need, and when you need them. Takes about two minutes.",
  },
  {
    icon: Search,
    title: "Find your team",
    body: "Browse applications from verified members, see their work, and accept the people you want on your team.",
  },
  {
    icon: Rocket,
    title: "Ship together",
    body: "Collaborate, build, and ship. Mark your project complete and keep the team in your network.",
  },
];

const USE_CASES = [
  { icon: Trophy, label: "Hackathons", body: "Form a team for the next ICPC, IEEEXtreme, or local hackathon." },
  { icon: FlaskConical, label: "Research", body: "Find a co-author or a methods reviewer for your paper or thesis." },
  { icon: Code2, label: "Open source", body: "Maintainers looking for contributors, contributors looking for projects." },
  { icon: Rocket, label: "Startups", body: "Cofounder, technical lead, or first hire — all from a trusted network." },
  { icon: GraduationCap, label: "Course projects", body: "Capstone, thesis, group assignments — without the awkward cold-DMs." },
  { icon: Megaphone, label: "Student orgs", body: "Clubs and societies recruiting designers, devs, writers, and ops." },
  { icon: Sparkles, label: "Side projects", body: "That idea you've been sitting on. Find the people who make it real." },
  { icon: Wrench, label: "Freelance / gig", body: "Skilled people for short paid or pro-bono engagements." },
];

export const dynamic = "force-dynamic";


export default function TimTimPage() {
  return (
    <div className="container-page py-12">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] to-transparent pointer-events-none" />
        <div className="py-14 md:py-20 max-w-3xl">
          <Badge variant="gold" className="mb-4">
            <Sparkles className="h-3 w-3" /> New on Gonix
          </Badge>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05]">
            Find your own team
            <br />
            for your work.
          </h1>
          <p className="text-fg-muted mt-5 text-base md:text-lg max-w-xl">
            TimTim is where verified students, teachers, and alumni find collaborators — for hackathons, research,
            side projects, startups, and student orgs. Post what you&apos;re building. Find the people you need. Ship it.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/timtim/browse">
              <Button size="lg">
                <Search className="h-4 w-4" /> Browse projects
              </Button>
            </Link>
            <Link href="/timtim/new">
              <Button size="lg" variant="outline">
                <Plus className="h-4 w-4" /> Post a project
              </Button>
            </Link>
          </div>
          <p className="text-xs text-fg-dim mt-4 flex items-center gap-1.5">
            <Shield className="h-3 w-3" /> Only verified Gonix members can post or apply.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">How it works</p>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">From idea to team in three steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="h-full">
              <CardHeader>
                <div className="h-10 w-10 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] uppercase tracking-widest text-fg-dim">Step {i + 1}</p>
                <CardTitle>{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-fg-muted leading-relaxed">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="py-14 border-t border-line">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">What you can use it for</p>
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Any kind of work, any size of team</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {USE_CASES.map((u) => (
            <Card key={u.label} className="h-full hover:border-accent/30 transition-all duration-200">
              <div className="h-10 w-10 rounded-md bg-fg/5 border border-line flex items-center justify-center text-fg-muted mb-3">
                <u.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">{u.label}</p>
              <p className="text-xs text-fg-muted mt-1.5 leading-relaxed">{u.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-10">
        <Card className="border-accent/20 bg-accent/[0.03]">
          <CardContent className="py-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold">Built on trust, not just reach</p>
              <p className="text-sm text-fg-muted mt-1.5 max-w-2xl leading-relaxed">
                Every person you can team up with on TimTim has been identity-verified by a Gonix admin against a
                real Bangladeshi university. No bots, no fakes, no anonymous ghost accounts.
              </p>
            </div>
            <Link href="/register">
              <Button variant="outline" size="sm">
                Get verified <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Bottom CTA */}
      <section className="py-10 border-t border-line text-center">
        <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Ready to find your team?</h2>
        <p className="text-sm text-fg-muted mt-2 max-w-md mx-auto">
          Browse what others are building, or post your own project and let the right people find you.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/timtim/browse">
            <Button>
              <Users className="h-4 w-4" /> Browse projects
            </Button>
          </Link>
          <Link href="/timtim/new">
            <Button variant="outline">
              <UserPlus className="h-4 w-4" /> Post a project
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
