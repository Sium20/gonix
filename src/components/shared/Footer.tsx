import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-soft mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-accent to-rose-900 flex items-center justify-center font-serif font-bold text-black text-xs">G</div>
              <p className="font-semibold tracking-tight">Gonix</p>
            </div>
            <p className="text-sm text-fg-muted max-w-sm">
              The verified academic network for Bangladeshi universities. Every profile you see corresponds to a real, admin-verified person.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="text-fg-muted hover:text-fg">Directory</Link></li>
              <li><Link href="/universities" className="text-fg-muted hover:text-fg">Universities</Link></li>
              <li><Link href="/timtim" className="text-fg-muted hover:text-fg">TimTim</Link></li>
              <li><Link href="/signup" className="text-fg-muted hover:text-fg">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim mb-3">Legal</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-fg-muted hover:text-fg">Privacy</Link></li>
              <li><Link href="/terms" className="text-fg-muted hover:text-fg">Terms</Link></li>
              <li><Link href="/contact" className="text-fg-muted hover:text-fg">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-fg-dim">© {new Date().getFullYear()} Gonix. All rights reserved.</p>
          <p className="text-xs text-fg-dim">Built with care in 🇧🇩 Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
