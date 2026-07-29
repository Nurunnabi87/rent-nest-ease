export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://rent-nest-nurunnabi-jewels-projects.vercel.app";

export const TOKEN_COOKIE = "rentnest_token";

export const DASHBOARD_HOME: Record<string, string> = {
  TENANT: "/dashboard/tenant",
  LANDLORD: "/dashboard/landlord",
  ADMIN: "/dashboard/admin",
};

export const STRIPE_TEST_CARD = "4242 4242 4242 4242";
