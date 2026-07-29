"use client";

import { useMemo, useState } from "react";
import { Ban, Search, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";

const ANY = "any";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState(ANY);
  const [status, setStatus] = useState(ANY);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useAdminUsers({
    page: String(page),
    limit: "10",
    ...(role !== ANY ? { role } : {}),
    ...(status !== ANY ? { status } : {}),
  });

  const mutation = useUpdateUserStatus();

  // The backend has no user-search param, so filter the current page locally.
  const users = useMemo(() => {
    const list = data?.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }, [data, search]);

  const resetToFirstPage = (apply: () => void) => {
    apply();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Review platform accounts and ban or reinstate them."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search this page by name or email…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={role} onValueChange={(v) => resetToFirstPage(() => setRole(v))}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Any role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any role</SelectItem>
            <SelectItem value="TENANT">Tenant</SelectItem>
            <SelectItem value="LANDLORD">Landlord</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => resetToFirstPage(() => setStatus(v))}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : error ? (
        <EmptyState title="Couldn't load users" description={getErrorMessage(error)} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match these filters"
          description="Try clearing the search box or changing the role and status filters."
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isBanned = user.status === "BANNED";
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-muted-foreground">{user.phone}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role === "ADMIN" ? (
                            <span className="text-xs text-muted-foreground">
                              Protected
                            </span>
                          ) : (
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant={isBanned ? "outline" : "ghost"}
                                  size="sm"
                                  disabled={mutation.isPending}
                                >
                                  {isBanned ? (
                                    <>
                                      <ShieldCheck className="size-3.5" />
                                      Unban
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="size-3.5 text-destructive" />
                                      Ban
                                    </>
                                  )}
                                </Button>
                              }
                              title={isBanned ? "Reinstate this user?" : "Ban this user?"}
                              description={
                                isBanned
                                  ? `${user.name} will regain access to the platform immediately.`
                                  : `${user.name} will be signed out and blocked from using the platform until reinstated.`
                              }
                              confirmLabel={isBanned ? "Unban user" : "Ban user"}
                              destructive={!isBanned}
                              onConfirm={() =>
                                mutation.mutate({
                                  id: user.id,
                                  status: isBanned ? "ACTIVE" : "BANNED",
                                })
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <TablePagination meta={data?.meta} onPageChange={setPage} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
