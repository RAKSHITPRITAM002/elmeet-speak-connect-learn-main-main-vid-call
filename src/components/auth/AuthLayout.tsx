
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReactNode } from "react";
import { TreeBackdrop } from "./TreeBackdrop";

/**
 * Main Auth layout - includes navbar, backdrop tree, and footer.
 * Backdrop is visually styled with logo-tree in yellow/blue/white.
 */
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative isolate bg-gradient-to-br from-[#ecf6ff] via-[#fef7cd] to-[#FCF3CF]">
      <TreeBackdrop />
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        {children}
      </div>
      <Footer />
    </div>
  );
}
