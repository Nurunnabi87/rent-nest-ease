import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-xl font-bold text-primary"
      >
        <Home className="size-6" />
        RentNest
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
