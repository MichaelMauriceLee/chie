"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

type NotFoundPageProps = {
  title: string;
  description: string;
  backHome: string;
};

export default function NotFoundPage({
  title,
  description,
  backHome,
}: NotFoundPageProps) {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-5xl font-bold text-gray-900">{title}</h1>
      <p className="mt-4 text-lg text-gray-600">{description}</p>
      <Button className="mt-6" onClick={handleBackHome}>
        {backHome}
      </Button>
    </div>
  );
}
