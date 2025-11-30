import * as React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { TbEye, TbEyeClosed } from "react-icons/tb";
import { Button } from "./button";
import { Label } from "./label";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  allowMultiple?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      type,
      allowMultiple,
      value,
      defaultValue,
      label,
      ...props
    },
    ref
  ) => {
    const [show, setShow] = React.useState(false);
    const handleClick = () => setShow(!show);

    const multipleAttr =
      type === "file" ? { multiple: allowMultiple || false } : {};

    const inputId = React.useId();

    const localInputRef = React.useRef<HTMLInputElement>(null);

    const triggerClick = () => {
      localInputRef.current?.click();
    };
    return (
      <div className="">
        {label && (
          <Label className="peer-disabled:text-muted-foreground text-sm font-medium text-text-primary">
            {label}
          </Label>
        )}
        <div className="relative">
          {type !== "file" && (
            <input
              type={type === "password" ? (show ? "text" : "password") : type}
              placeholder=" "
              className={cn(
                "flex relative peer h-12 w-full rounded-xl bg-transparent border border-[#909090] px-3 text-sm placeholder:text-muted-foreground focus:outline-[#00328B] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#ececec] disabled:border-0",
                leftIcon && "pl-8",
                rightIcon && "pr-12",
                className
              )}
              ref={ref}
              {...props}
            />
          )}
          {(type === "password" || rightIcon) && (
            <span className="absolute inset-y-0 right-0 flex items-center">
              {type === "password" && !rightIcon && (
                <Button
                  aria-label="toggle show password"
                  onClick={handleClick}
                  size="sm"
                  type="button"
                  variant="unstyled"
                  className="text-primary"
                >
                  {show ? (
                    <TbEye className="h-20 w-20" />
                  ) : (
                    <TbEyeClosed className="h-20 w-20" />
                  )}
                </Button>
              )}
              {rightIcon}
            </span>
          )}

          {type === "file" && (
            <>
              <input
                id={inputId}
                type="file"
                ref={localInputRef}
                className="hidden"
                {...multipleAttr}
                {...props}
              />

              <div
                onClick={triggerClick}
                className="flex flex-col items-center justify-center w-full h-40 rounded-lg cursor-pointer border-lineColor bg-[#FDFDFD] transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <Image
                    src="/images/ussd-icon.png"
                    alt="logo"
                    width={70}
                    height={70}
                  />{" "}
                  <p className="text-sm font-bold mt-5 text-[#4D4D4D] max-w-xs text-center">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{" "}
                    or drag and drop PDF (max. 5MB)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
