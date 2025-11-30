import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen bg-[#FDFDFD] overflow-y-hidden px-6">
      <div className="fixed flex items-center justify-between w-full z-50 py-4 pr-8 md:pr-12">
        <Image src="/images/logo.png" alt="Logo" width={60} height={60} />
        <Link href="/login">
          <Button className="px-6 py-2 rounded-md bg-[#4C0463] text-white font-semibold shadow-md">
            Login
          </Button>
        </Link>
      </div>

      {/* Value Proposition */}
      <div className="flex flex-col items-center justify-center text-center mt-28 z-20 relative">
        <p className="text-2xl text-[#4C0463] font-semibold">CoralPay</p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#222222] mt-2 max-w-6xl">
          Your Self-Service Platform for Rapid USSD Application Development
        </h1>
        <p className="text-[#222222] text-xl font-semibold mt-4 max-w-4xl">
          Fast, scalable, and secures self-service platform that simplifies USSD
          application development by allowing users to quickly create menus and
          integrate them with their business logic.
        </p>
      </div>

      {/* Background Illustration */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/images/landing-background.png"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-90"
        />
      </div>

      {/* Dashboard Image */}
      <div className="flex justify-center mt-20 relative z-10">
        <Image
          src="/images/dashboardImage.png"
          alt="Dashboard"
          width={1000}
          height={600}
          className="rounded-xl shadow-lg border"
        />
      </div>
    </div>
  );
}
