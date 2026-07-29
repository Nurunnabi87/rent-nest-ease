"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiFetch, applyFieldErrors, getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { registerSchema, type RegisterValues } from "@/schemas/auth.schema";

const ROLE_OPTIONS = [
  {
    value: "TENANT" as const,
    label: "Tenant",
    description: "I'm looking for a place to rent",
    icon: User,
  },
  {
    value: "LANDLORD" as const,
    label: "Landlord",
    description: "I want to list my properties",
    icon: Building2,
  },
];

export function RegisterForm() {
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "TENANT" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          ...(values.phone ? { phone: values.phone } : {}),
        }),
      });
      toast.success("Account created! Logging you in…");
      // Register doesn't return a token — chain straight into login.
      await login(values.email, values.password);
    } catch (error) {
      if (
        !applyFieldErrors(error, setError, ["name", "email", "password", "phone", "role"])
      ) {
        toast.error(getErrorMessage(error));
      }
      setSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Join RentNest as a tenant or landlord</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.role}>
              <FieldLabel>I am a…</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors",
                          field.value === option.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <option.icon className="size-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-xs">{option.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
              <FieldError errors={[errors.role]} />
            </Field>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
