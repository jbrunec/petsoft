import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#5dc9a8] min-h-screen flex flex-col xl:flex-row items-center justify-center gap-10">
      <Image
        src={
          "https://bytegrad.com/course-assets/react-nextjs/petsoft-preview.png"
        }
        width={519}
        height={472}
        alt="Preview of PetSoft"
      />
      <div>
        <Logo />
        <h1 className="text-5xl font-semibold my-6 max-w-[500px]">
          Manage you <span className="font-extrabold">pet daycare</span> with
          ease
        </h1>
        <p className="text-2xl font-medium max-w-[500px]">
          Use PetSoft to easily keep track of pets under your care. Get lifetime
          acces for $299
        </p>
        <div className="mt-10 space-x-3">
          <Button asChild>
            <Link href={"/signup"}>Get started</Link>
          </Button>
          <Button asChild variant={"secondary"}>
            <Link href={"/login"}>Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
