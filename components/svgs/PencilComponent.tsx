import * as React from "react";

export interface PenSquareIconProps extends React.SVGProps<SVGSVGElement> {
  /** Width & height in px (applies to both). Defaults to 22. */
  size?: number | string;
  /** Icon color; uses CSS currentColor by default. */
  color?: string;
  /** Accessible label (set to empty string to mark as decorative). */
  "aria-label"?: string;
}

export const EditPenSquareIcon = React.forwardRef<
  SVGSVGElement,
  PenSquareIconProps
>(
  (
    {
      size = 22,
      color = "currentColor",
      className,
      "aria-label": ariaLabel = "Pen Square Icon",
      ...rest
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 22 22"
        xmlns="http://www.w3.org/2000/svg"
        role={ariaLabel ? "img" : "presentation"}
        aria-label={ariaLabel || undefined}
        aria-hidden={ariaLabel ? undefined : true}
        className={className}
        {...rest}
      >
        <path
          d="M19.7785 6.06166L15.938 2.22198C15.6157 1.89976 15.1786 1.71875 14.7228 1.71875C14.2671 1.71875 13.83 1.89976 13.5077 2.22198L2.90985 12.8189C2.7497 12.9781 2.62273 13.1675 2.53629 13.376C2.44984 13.5846 2.40564 13.8083 2.40626 14.0341V17.8746C2.40626 18.3305 2.58734 18.7676 2.90967 19.09C3.23199 19.4123 3.66917 19.5934 4.12501 19.5934H18.5625C18.836 19.5934 19.0983 19.4847 19.2917 19.2913C19.4851 19.0979 19.5938 18.8356 19.5938 18.5621C19.5938 18.2886 19.4851 18.0263 19.2917 17.8329C19.0983 17.6395 18.836 17.5309 18.5625 17.5309H10.7422L19.7785 8.49284C19.9382 8.33323 20.0649 8.14372 20.1513 7.93515C20.2377 7.72657 20.2822 7.50302 20.2822 7.27725C20.2822 7.05148 20.2377 6.82793 20.1513 6.61935C20.0649 6.41078 19.9382 6.22127 19.7785 6.06166ZM7.82032 17.5309H4.46876V14.1793L11.6875 6.96057L15.0391 10.3121L7.82032 17.5309ZM16.5 8.8512L13.1484 5.49963L14.7245 3.92354L18.0761 7.2751L16.5 8.8512Z"
          fill={color}
        />
      </svg>
    );
  }
);

EditPenSquareIcon.displayName = "EditPenSquareIcon";

export default EditPenSquareIcon;
