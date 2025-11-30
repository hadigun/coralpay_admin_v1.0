import Image from "next/image";
import { Button } from "../ui/button";

export function StepOne({ setStep, setType, type }: any) {
  return (
    <div>
      <h2 className="text-lg font-medium">Apply for a Short Code</h2>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        Do you want a dedicated or shared USSD short code?
      </p>

      <div className="flex items-center gap-4 mb-4">
        {["dedicated", "shared"].map((item) => (
          <div
            key={item}
            className={`border border-[#FDFDFD] rounded-lg p-6 w-full cursor-pointer ${
              type === item ? "ring-2 ring-primary bg-[#A476B214]" : ""
            }`}
            onClick={() => setType(item)}
          >
            <Image
              src="/images/ussd-icon.png"
              alt="logo"
              width={70}
              height={70}
            />
            <p className="font-medium mt-2 capitalize">
              {item} USSD Short Code
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          className="bg-[#D5C6DC] text-primary"
          onClick={() => setStep(1)}
        >
          Cancel
        </Button>
        <Button disabled={!type} onClick={() => setStep(2)}>
          Proceed
        </Button>
      </div>
    </div>
  );
}
