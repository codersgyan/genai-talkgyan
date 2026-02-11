import Link from "next/link";
import Image from "next/image";

import LeftSidebar from "@/components/left-sidebar";
import RightSidebar from "@/components/right-sidebar";

import { LucideLanguages, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <header className="relative z-50 w-full border-b">
      <div className="relative flex h-16 items-center px-4 md:px-6">
        {/* LEFT: Config */}
        <div className="flex items-center">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings2 className="h-5 w-5" />
                  <span className="sr-only">Open configuration</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="sr-only">
                  <SheetTitle>Configuration</SheetTitle>
                  <SheetDescription>
                    Set your app configuration
                  </SheetDescription>
                </SheetHeader>
                <LeftSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* CENTER: Logo (Larger) */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-md">
            <Image
              src="/logo.png"
              alt="TalkGyan AI"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="text-lg md:text-xl font-semibold tracking-tight">
            Talk
            <span className="text-primary">Gyan</span> AI
          </span>
        </Link>

        {/* RIGHT: Transcript */}
        <div className="ml-auto flex items-center">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <LucideLanguages className="h-5 w-5" />
                  <span className="sr-only">Open transcript</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="sr-only">
                  <SheetTitle>Transcript</SheetTitle>
                  <SheetDescription>
                    Voice conversation transcript
                  </SheetDescription>
                </SheetHeader>
                <RightSidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
