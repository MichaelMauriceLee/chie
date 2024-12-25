import DictionaryInput from "@/components/dictionary-input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DictionaryResult from "@/components/dictionary-result";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { query } = await searchParams;

  return (
    <div className="min-h-screen px-10 pt-4 flex flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Chie</h1>
      </div>

      <DictionaryInput initialText={query ?? ""} />

      <Suspense
        fallback={
          <Card className="mt-4">
            <CardHeader>
              <Skeleton className="h-4 w-2/3 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-5/6 mb-2" />
              <Skeleton className="h-3 w-4/5" />
            </CardContent>
          </Card>
        }
      >
        {query && <DictionaryResult query={decodeURIComponent(query)} />}
      </Suspense>
    </div>
  );
}
