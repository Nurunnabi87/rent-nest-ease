import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  Availability,
  PaymentStatus,
  RentalStatus,
  UserStatus,
} from "@/types/models";

const RENTAL_STYLES: Record<RentalStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  COMPLETED: "bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
};

const AVAILABILITY_STYLES: Record<Availability, string> = {
  AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  RENTED: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  UNAVAILABLE: "bg-gray-200 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

const USER_STYLES: Record<UserStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  BANNED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

const ALL_STYLES: Record<string, string> = {
  ...RENTAL_STYLES,
  ...AVAILABILITY_STYLES,
  ...PAYMENT_STYLES,
  ...USER_STYLES,
};

export function StatusBadge({
  status,
  className,
}: {
  status: RentalStatus | Availability | PaymentStatus | UserStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent font-medium", ALL_STYLES[status], className)}
    >
      {status}
    </Badge>
  );
}
