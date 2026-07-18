"use client";

import { useState } from "react";
import { signOut } from "@/app/actions";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function AuthButton({ user }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/settings">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </Button>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit" className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}