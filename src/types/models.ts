export type Role = "TENANT" | "LANDLORD" | "ADMIN";
export type UserStatus = "ACTIVE" | "BANNED";
export type Availability = "AVAILABLE" | "RENTED" | "UNAVAILABLE";
export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  status?: UserStatus;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  _count?: { properties: number };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  availability: Availability;
  isDeleted?: boolean;
  categoryId: string;
  category?: Category;
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { rentalRequests: number; reviews: number };
}

export interface PropertyDetails extends Property {
  landlord: { id: string; name: string; email: string; phone: string | null };
  reviews: Review[];
  averageRating: number | null;
  totalReviews: number;
}

/**
 * Payment fields vary by endpoint: the tenant's rental list returns
 * `{ id, status, amount, paidAt }` while the landlord's request list only
 * selects `{ status, paidAt }`.
 */
export interface PaymentSummary {
  id?: string;
  status: PaymentStatus;
  amount?: number;
  paidAt: string | null;
}

/** Same story for the embedded property — the landlord list omits `location`. */
export type EmbeddedProperty = Partial<Property> &
  Pick<Property, "id" | "title" | "rentAmount">;

export interface RentalRequest {
  id: string;
  status: RentalStatus;
  message: string | null;
  moveInDate: string;
  durationMonths: number;
  landlordNote: string | null;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  propertyId: string;
  property?: EmbeddedProperty;
  tenant?: { id: string; name: string; email: string; phone?: string | null };
  payment?: PaymentSummary | null;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  provider: "STRIPE" | "SSLCOMMERZ";
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  rentalRequestId: string;
  rentalRequest?: {
    id: string;
    status: RentalStatus;
    property?: { id?: string; title: string; location: string };
  };
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  tenantId?: string;
  propertyId?: string;
  tenant?: { id?: string; name: string };
  property?: { id: string; title: string; location?: string };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface CheckoutSession {
  paymentId: string;
  checkoutUrl: string;
  message?: string;
}
