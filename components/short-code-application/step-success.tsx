import Image from "next/image";
import { Button } from "../ui/button";

export function StepSuccess({
  onOpenChange,
}: {
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <div className="text-center py-10 flex flex-col items-center space-y-4">
      <div className=" text-primary text-2xl">
        <Image
          src="/images/success-image.png"
          alt="logo"
          width={100}
          height={100}
        />
      </div>
      <div className="">
        {" "}
        <h3 className="text-lg font-semibold">Application sent successfully</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Your application has been submitted successfully. You’ll be notified
          when it’s reviewed.
        </p>
      </div>

      <Button className="w-full py-2" onClick={() => onOpenChange(false)}>
        Okay
      </Button>
    </div>
  );
}
