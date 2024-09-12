"use client";
import { createCheckoutSession } from "@/actions/actions";
import H1 from "@/components/h1";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};
export default function Page({ searchParams }: PageProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();
  return (
    <main className="flex flex-col items-center space-y-10">
      <H1>PetSoft access requires payment.</H1>
      {searchParams.success && (
        <Button
          onClick={async () => {
            await update(true); // for some reason we need to pass true with this version
            router.push("/app/dashboard");
          }}
        >
          Access PetSoft
        </Button>
      )}
      {!searchParams.success && (
        <Button
          disabled={isPending}
          onClick={async () => {
            startTransition(async () => {
              await createCheckoutSession();
            });
          }}
        >
          Buy lifetime access for $299
        </Button>
      )}
      {searchParams.success && (
        <p className="text-sm text-green-700">
          Payment successful! You now have lifetime access to PetSoft.
        </p>
      )}
      {searchParams.cancelled && (
        <p className="text-sm text-red-700">
          Payment cancelled. You can try again.
        </p>
      )}
    </main>
  );
}
