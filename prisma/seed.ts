import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_UNIVERSITIES } from "./universities-data";

const prisma = new PrismaClient();

const DEPARTMENTS: Record<string, string[]> = {
  BUET: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering", "Civil Engineering", "Architecture", "Chemical Engineering", "Industrial & Production Engineering", "Water Resources Engineering"],
  DU: ["Computer Science", "Electrical & Electronic Engineering", "Economics", "Management", "Accounting", "English", "Bangla", "Physics", "Chemistry", "Mathematics"],
  CUET: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering", "Civil Engineering"],
  KUET: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering", "Civil Engineering"],
  RUET: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering", "Civil Engineering"],
  BRACU: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Business Administration", "Economics", "Architecture", "Pharmacy", "Law"],
  NSU: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Business Administration", "Economics"],
  IUB: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Business Administration", "Economics", "Media Studies"],
  AIUB: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Business Administration"],
  AUST: ["Computer Science & Engineering", "Electrical & Electronic Engineering", "Mechanical Engineering", "Civil Engineering", "Architecture", "Business Administration"],
  "DIU-Daffodil": ["Computer Science & Engineering", "Software Engineering", "Business Administration", "English"],
};

async function main() {
  console.log("→ Resetting & seeding…");

  // Order matters due to FKs
  await prisma.auditLog.deleteMany();
  await prisma.adminNote.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.university.deleteMany();

  const uniMap = new Map<string, string>(); // name → id
  for (const u of ALL_UNIVERSITIES) {
    const created = await prisma.university.create({ data: u });
    uniMap.set(u.name, created.id);
  }
  console.log(`✓ Seeded ${ALL_UNIVERSITIES.length} universities`);

  let deptCount = 0;
  for (const [uniName, depts] of Object.entries(DEPARTMENTS)) {
    const uniId = uniMap.get(uniName);
    if (!uniId) continue;
    for (const d of depts) {
      await prisma.department.create({
        data: { universityId: uniId, name: d, code: d.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 4) },
      });
      deptCount++;
    }
  }
  console.log(`✓ Seeded ${deptCount} departments`);

  // Super admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.profile.create({
    data: {
      email: "admin@tsportal.bd",
      passwordHash: adminPassword,
      fullName: "Gonix Admin",
      handle: "admin",
      role: "super_admin",
      universityId: uniMap.get("DU")!,
      status: "verified",
      verifiedAt: new Date(),
      bio: "Official Gonix administrator account.",
    },
  });
  console.log(`✓ Created super admin: admin@tsportal.bd / admin123`);

  // Demo verified profiles
  const password = await bcrypt.hash("demo1234", 10);
  const buetId = uniMap.get("BUET")!;
  const bracId = uniMap.get("BRACU")!;
  const duId = uniMap.get("DU")!;

  const cseDeptBuet = await prisma.department.findFirst({ where: { universityId: buetId, name: { contains: "Computer Science" } } });
  const cseDeptBrac = await prisma.department.findFirst({ where: { universityId: bracId, name: { contains: "Computer Science" } } });
  const ecoDeptDu = await prisma.department.findFirst({ where: { universityId: duId, name: "Economics" } });

  const demos: Array<{ email: string; fullName: string; handle: string; role: string; universityId: string; departmentId?: string; bio: string; batchYear?: number; studentId?: string; facultyId?: string; designation?: string; graduationYear?: number; currentCompany?: string; currentTitle?: string; degree?: string }> = [
    {
      email: "rafi@tsportal.bd",
      fullName: "Rafi Ahmed",
      handle: "rafi-buet-cse",
      role: "student",
      universityId: buetId,
      departmentId: cseDeptBuet?.id,
      batchYear: 2023,
      studentId: "202314001",
      bio: "CSE undergrad at BUET. Building side projects, mostly TypeScript and Rust. Looking for hackathon teammates.",
    },
    {
      email: "nazia@tsportal.bd",
      fullName: "Dr. Nazia Hassan",
      handle: "dr-nazia-brac",
      role: "teacher",
      universityId: bracId,
      departmentId: cseDeptBrac?.id,
      facultyId: "F-2041",
      designation: "Associate Professor",
      bio: "Associate Professor, BRAC University. Research interests: HCI, accessibility, ML for education.",
    },
    {
      email: "tasnim@tsportal.bd",
      fullName: "Tasnim Rahman",
      handle: "tasnim-du-eco",
      role: "alumni",
      universityId: duId,
      departmentId: ecoDeptDu?.id,
      batchYear: 2014,
      graduationYear: 2018,
      degree: "BSS Economics",
      currentCompany: "Grameenphone",
      currentTitle: "Senior Product Manager",
      bio: "DU Economics '18. Now building products at Grameenphone. Happy to mentor.",
    },
  ];

  for (const d of demos) {
    await prisma.profile.create({
      data: {
        ...d,
        passwordHash: password,
        status: "verified",
        verifiedAt: new Date(),
        verifiedById: admin.id,
        socialLinks: JSON.stringify({ linkedin: "https://linkedin.com/in/" + d.handle }),
        showEmail: true,
      },
    });
  }
  console.log(`✓ Seeded ${demos.length} demo verified profiles (password: demo1234)`);

  // Demo pending request (to populate the admin queue)
  const pendingUni = uniMap.get("AUST")!;
  const cseAust = await prisma.department.findFirst({ where: { universityId: pendingUni, name: { contains: "Computer Science" } } });
  const pending = await prisma.profile.create({
    data: {
      email: "sadia@tsportal.bd",
      passwordHash: password,
      fullName: "Sadia Islam",
      handle: "sadia-aust",
      role: "student",
      universityId: pendingUni,
      departmentId: cseAust?.id,
      batchYear: 2022,
      studentId: "202210023",
      bio: "AUST CSE student. Awaiting verification.",
      status: "pending",
    },
  });
  await prisma.verificationRequest.create({
    data: {
      profileId: pending.id,
      universityId: pendingUni,
      declaredUniversity: "AUST",
      declaredIdNumber: "202210023",
      institutionalEmail: "sadia.202210023@aust.edu",
      emailDomainMatch: true,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h ago
    },
  });
  console.log(`✓ Seeded 1 pending verification: sadia@tsportal.bd`);

  // ─── Demo blog posts ────────────────────────────────────────────────
  // Each post has a colored gradient placeholder (no image uploads in v1).
  // We attach posts to: rafi (student), nazia (teacher), and also create
  // a couple more authors so the feed feels real.
  const saif = await prisma.profile.create({
    data: {
      email: "saif@tsportal.bd",
      passwordHash: password,
      fullName: "Saif Iqbal",
      handle: "saif-iut-cse",
      role: "student",
      universityId: uniMap.get("IUT")!,
      departmentId: (await prisma.department.findFirst({ where: { universityId: uniMap.get("IUT")!, name: { contains: "Computer" } } }))?.id,
      batchYear: 2022,
      studentId: "220041001",
      bio: "IUT CSE. Interested in distributed systems and competitive programming.",
      status: "verified",
      verifiedAt: new Date(),
      verifiedById: admin.id,
      socialLinks: JSON.stringify({ github: "https://github.com/saif-iqbal" }),
    },
  });

  const teacher2 = await prisma.profile.create({
    data: {
      email: "faisal@tsportal.bd",
      fullName: "Dr. Faisal Hossain",
      handle: "dr-faisal-nsu",
      role: "teacher",
      universityId: uniMap.get("NSU")!,
      departmentId: (await prisma.department.findFirst({ where: { universityId: uniMap.get("NSU")!, name: { contains: "Computer" } } }))?.id,
      facultyId: "F-1024",
      designation: "Assistant Professor",
      bio: "NSU CSE. Research in NLP and Bangla language models.",
      status: "verified",
      verifiedAt: new Date(),
      verifiedById: admin.id,
      passwordHash: password,
    },
  });

  const student2 = await prisma.profile.create({
    data: {
      email: "nusrat@tsportal.bd",
      fullName: "Nusrat Jahan",
      handle: "nusrat-buet-cse",
      role: "student",
      universityId: uniMap.get("BUET")!,
      departmentId: (await prisma.department.findFirst({ where: { universityId: uniMap.get("BUET")!, name: { contains: "Computer" } } }))?.id,
      batchYear: 2021,
      studentId: "2105001",
      bio: "BUET CSE '21. President, BUET Debating Club. Love writing about student life.",
      status: "verified",
      verifiedAt: new Date(),
      verifiedById: admin.id,
      passwordHash: password,
    },
  });

  const posts = [
    {
      authorId: saif.id,
      title: "How I went from zero ICPC to regionals in 18 months",
      slug: "zero-to-regionals-icpc-18-months",
      excerpt: "A personal account of the practice routine, the failures, the breakthroughs, and the people who made it possible. Plus the exact problem sets I solved.",
      body: `When I first sat in a programming contest in my first year at IUT, I could barely solve the warm-up. Eighteen months later, I was on the regionals floor.\n\nHere is what actually moved the needle:\n\n1. Daily deliberate practice. 90 minutes, every day, no exceptions. 3 problems: one easy (build confidence), one medium (extend range), one hard (break and rebuild).\n2. Editorial-first learning. After every contest, I read the editorial of every problem I didn't solve — even the easy ones others breezed through.\n3. A small, consistent team. We met three times a week. No heroics, just showing up.\n\nThe truth is, competitive programming rewards consistency far more than talent. If you're starting out and wondering if you're "good enough" — you're not, yet. That's the point.`,
      category: "Experience",
      coverColor: "amber",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
    },
    {
      authorId: (await prisma.profile.findUnique({ where: { email: "nazia@tsportal.bd" } }))!.id,
      title: "Why accessibility should be your first design constraint, not your last",
      slug: "accessibility-first-design-constraint",
      excerpt: "Most teams treat accessibility as a checklist at the end. This is a trap. Here is why designing for the edges makes the center better.",
      body: `For the first five years of my career, I treated accessibility as a QA pass: ship the feature, then ask "is this accessible?" It almost never was, and the rewrites were painful.\n\nThree years ago I switched teams. The lead designer was blind in one eye. She had a simple rule: **if a feature doesn't work with keyboard alone, it doesn't ship**.\n\nIt felt extreme for about a month. Then everything we built started feeling... better. Faster, clearer, more robust. Not because accessibility is magic, but because constraints breed good design.\n\nTry it for a sprint. Disable your mouse for one day. Use only the keyboard. Watch where you get stuck. That's the work.`,
      category: "Opinion",
      coverColor: "emerald",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18h ago
    },
    {
      authorId: teacher2.id,
      title: "Building a Bangla sentiment classifier with 200k real-world reviews",
      slug: "bangla-sentiment-classifier-200k-reviews",
      excerpt: "We scraped, cleaned, and labeled 200,000 Bangla product reviews. Here's what we learned about Bangla NLP, the tools that work, and the pitfalls to avoid.",
      body: `Bangla NLP has a tooling problem. Most "Bangla" models on HuggingFace are actually multilingual models that happen to handle Bangla as a side effect.\n\nFor our recent paper, we wanted a Bangla-first sentiment classifier. Steps:\n\n1. **Data**: 200k product reviews from Daraz and Chaldal, labeled via a BERT-assisted pipeline + human spot-checks.\n2. **Tokenizer**: We trained a SentencePiece tokenizer from scratch on 50MB of Bangla web text. Off-the-shelf tokenizers were brutalizing compound words.\n3. **Base model**: We started with XLM-R and continued pre-training on Bangla before fine-tuning. The lift was 4.3 F1 over vanilla XLM-R.\n\nThe dataset and model are on our lab's GitHub. PRs welcome.`,
      category: "Research",
      coverColor: "indigo",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36h ago
    },
    {
      authorId: (await prisma.profile.findUnique({ where: { email: "rafi@tsportal.bd" } }))!.id,
      title: "I shipped a TypeScript side project to 2,000 users in 90 days. Here is the tech stack.",
      slug: "typescript-side-project-2000-users-90-days",
      excerpt: "Next.js, Supabase, Tailwind, and one carefully chosen boring database. Plus the three mistakes that cost me a week each.",
      body: `In March I had an idea. By June it had 2,000 monthly active users. The tech stack is the boring part — the interesting part is what I learned about distribution.\n\nThe stack:\n- **Next.js 14 (App Router)** for the app\n- **Supabase** for auth, Postgres, and file storage\n- **Tailwind + shadcn/ui** for the UI\n- **Resend** for transactional email\n- **Vercel** for hosting\n\nWhat cost me time:\n1. Trying to do realtime with Supabase before validating the core flow. I burned a week.\n2. Custom auth. I almost built a custom auth system. Don't.\n3. Optimizing the landing page before I had 10 users. Vanity work.\n\nDistribution beats tech. Pick boring tools. Ship.`,
      category: "Experience",
      coverColor: "rose",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 60), // 2.5d ago
    },
    {
      authorId: student2.id,
      title: "What I wish I knew before joining the BUET Debating Club",
      slug: "buet-debating-club-first-year",
      excerpt: "Three years in, I'm still learning. Here is the unfiltered version of what freshman debaters should know — and what they should ignore.",
      body: `The Debating Club at BUET is the best thing that ever happened to me. It is also the most demanding thing I have ever done.\n\nA few things I wish I had known:\n\n- **The first 3 months are about listening, not speaking.** Volunteer to time, to chair, to research. You learn more in those seats than in any speech.\n- **Your first tournament will go badly.** That is the point. The goal is not to win. The goal is to find your weaknesses under pressure.\n- **Find two seniors who will tell you the truth.** Not the encouraging version. The real one.\n\nThe Club is a family. It is also, in the best way, a factory. The lessons compound for years.`,
      category: "Experience",
      coverColor: "violet",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4d ago
    },
    {
      authorId: teacher2.id,
      title: "Office hours are the most underutilized resource in Bangladeshi universities",
      slug: "office-hours-most-underutilized-resource",
      excerpt: "My students stopped coming to office hours. Then I changed one thing, and 40% of the class now shows up weekly. Here's what worked.",
      body: `Last semester, average attendance at my office hours was 1.2 students. This semester: 18.\n\nThe change? I stopped calling them "office hours" and started calling them "open lab". Same room, same time. Different name.\n\nWhy it worked: "Office hours" sounds like a thing you do when you are in trouble. "Open lab" sounds like a thing you do when you are curious.\n\nThe deeper lesson: framing matters more than structure. If students perceive your office as a confessional, they will avoid it. If they perceive it as a workshop, they will flock to it.\n\nI now serve tea. I do not know if that helps, but it does not hurt.`,
      category: "Opinion",
      coverColor: "teal",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5d ago
    },
  ];

  for (const p of posts) {
    await prisma.post.create({ data: p });
  }
  console.log(`✓ Seeded ${posts.length} blog posts`);

  console.log("\n🎉 Seed complete.\n");
  console.log("  Super admin login : admin@tsportal.bd / admin123");
  console.log("  Demo user login   : rafi@tsportal.bd / demo1234");
  console.log("  Pending user login: sadia@tsportal.bd / demo1234\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
