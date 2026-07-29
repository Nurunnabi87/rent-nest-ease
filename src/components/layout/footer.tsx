import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <Home className="size-5" />
            RentNest
          </Link>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Find &amp; list rental properties with ease.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/properties" className="hover:text-primary">
            Browse properties
          </Link>
          <Link href="/auth/register" className="hover:text-primary">
            Become a landlord
          </Link>
          <Link href="/auth/login" className="hover:text-primary">
            Log in
          </Link>
        </nav>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} RentNest. Built with Next.js.
      </div>
    </footer>
  );
}
