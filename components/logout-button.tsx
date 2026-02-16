"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="neo-button"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Log out
    </button>
  );
}
