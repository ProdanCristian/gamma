"use client";

import * as React from "react";
import { PiMoon, PiSun } from "react-icons/pi";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" -ml-4 mr-2  md:ml-0 md:mr-0">
        <button className="h-8 w-8 rounded-full shadow-none border-none transition-colors duration-200 bg-accent dark:bg-transparent relative flex items-center justify-center">
          <PiSun className="h-6 w-6 absolute rotate-0 scale-100 transition-all  text-black md:text-white dark:text-accent dark:-rotate-90 dark:scale-0" />
          <PiMoon className="h-6 w-6 absolute scale-0 transition-all text-white dark:text-accent dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dark:border-charade-600 border-charade-200"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
