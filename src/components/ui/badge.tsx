import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md h-[22px] px-2 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        outline: "text-foreground border border-border",
        blue: "bg-primary/10 text-primary",
        green: "bg-tf-green/10 text-tf-green",
        teal: "bg-tf-teal/10 text-tf-teal",
        yellow: "bg-tf-yellow/10 text-tf-yellow",
        orange: "bg-tf-orange/10 text-tf-orange",
        red: "bg-tf-red/10 text-tf-red",
        purple: "bg-tf-purple/10 text-tf-purple",
        neutral: "bg-secondary text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
