import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../libs/utils';

const hover = 'hover:drop-shadow-lg';

const inactive =
  'bg-volt-grey-inactive bg-opacity-50 rounded-default text-white';

const def =
  'bg-gradient-to-r from-volt-border-start to-volt-border-end text-white rounded-default';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-bromny-medium font-normal text-2xl whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: `${def} ${hover}`,
        inactive: `${inactive}`,
      },
      size: {
        default: 'w-full h-[64px]',
        topbarbtn: 'w-[160px] h-[64px]'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);


const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, label, children, ...props },
  ref,
) {
    const Comp = asChild ? Slot : 'button';
    const classes = cn(buttonVariants({ variant, size, className }));
    return (
      <Comp className={classes} ref={ref} {...props}>
        {label ? label : children}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
