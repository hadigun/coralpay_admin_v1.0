import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
}

export const StepIndicator = ({ steps }: StepIndicatorProps) => {
  return (
    <div className="w-full bg-gradient-to-b from-[#E9D5EF] to-[##F1EBF314] h-full p-6 lg:p-8 items-center flex flex-col">
      <div className="w-[80%]">
        <h2 className="text-xl font-semibold text-foreground mb-8">
          Create a New Merchant
        </h2>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
              ${
                step.completed
                  ? "bg-step-complete border-step-complete text-white"
                  : step.active
                  ? "bg-step-active border-step-active text-white"
                  : "bg-white border-step-inactive text-muted-foreground"
              }
            `}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`
                text-sm font-medium transition-colors duration-200
                ${
                  step.completed || step.active
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              `}
                >
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
