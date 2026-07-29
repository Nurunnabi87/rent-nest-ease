"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "rentAmount:asc", label: "Price: low to high" },
  { value: "rentAmount:desc", label: "Price: high to low" },
  { value: "title:asc", label: "Title: A–Z" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = `${searchParams.get("sortBy") ?? "createdAt"}:${
    searchParams.get("sortOrder") ?? "desc"
  }`;

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        const [sortBy, sortOrder] = value.split(":");
        const params = new URLSearchParams(searchParams.toString());
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }}
    >
      <SelectTrigger className="w-[190px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
