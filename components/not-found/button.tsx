"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

type BackHomeButtonProps = {
  label: string;
};

export default function BackHomeButton({ label }: BackHomeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const firstPathSegment = pathname.split("/")[1];

  const validLocale = routing.locales.includes(firstPathSegment as never)
    ? firstPathSegment
    : "";

  function handleBackHome() {
    router.push(validLocale ? `/${validLocale}` : "/");
  }

  return (
    <Button className="mt-6" onClick={handleBackHome}>
      {label}
    </Button>
  );
}
