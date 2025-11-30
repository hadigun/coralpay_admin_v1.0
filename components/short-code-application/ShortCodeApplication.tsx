import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { StepOne } from "./step-one";
import { StepSuccess } from "./step-success";
import { StepTwo } from "./step-two";

export function ApplyShortCodeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<"dedicated" | "shared" | null>(null);

  const reset = () => {
    setStep(1);
    setType(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogDescription />
      <DialogContent className="max-w-[20rem]">
        <DialogTitle />
        {step === 1 && (
          <StepOne setStep={setStep} setType={setType} type={type} />
        )}
        {step === 2 && <StepTwo setStep={setStep} type={type} />}
        {step === 3 && <StepSuccess onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}
