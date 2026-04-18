"use client";

import { useActionState } from "react";
import { adminLoginAction, type AdminActionState } from "@/app/admin/actions";

const initial: AdminActionState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="admin-pin" className="mb-1 block text-sm font-medium text-label">
          Admin-PIN (4 Ziffern)
        </label>
        <input
          id="admin-pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{4}"
          maxLength={4}
          required
          className="admin-input w-full max-w-xs font-mono tracking-widest"
          placeholder="••••"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="admin-btn-primary"
      >
        {pending ? "…" : "Anmelden"}
      </button>
    </form>
  );
}
