export const queryKeys = {
  me: ["auth", "me"] as const,
  categories: ["categories"] as const,
  properties: (filters?: Record<string, string>) =>
    filters ? (["properties", filters] as const) : (["properties"] as const),
  property: (id: string) => ["property", id] as const,
  tenantRentals: ["tenant", "rentals"] as const,
  tenantRental: (id: string) => ["tenant", "rental", id] as const,
  tenantPayments: ["tenant", "payments"] as const,
  tenantReviews: ["tenant", "reviews"] as const,
  landlordProperties: ["landlord", "properties"] as const,
  landlordRequests: (status?: string) =>
    status
      ? (["landlord", "requests", status] as const)
      : (["landlord", "requests"] as const),
  adminUsers: (params?: Record<string, string>) =>
    ["admin", "users", params ?? {}] as const,
  adminProperties: (params?: Record<string, string>) =>
    ["admin", "properties", params ?? {}] as const,
  adminRentals: (params?: Record<string, string>) =>
    ["admin", "rentals", params ?? {}] as const,
};
