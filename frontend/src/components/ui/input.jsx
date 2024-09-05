import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React, { useState } from 'react';

import { cn } from '../../libs/utils';

const inputVariants = cva(
  'rounded-input placeholder-volt-text-input-light-mode block px-4 py-2 transition-colors focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-1.5 border-volt-text-main',
        error: 'border border-rose-600',
      },
      inputSize: {
        default: 'w-[750px] h-[56px]',
      },
      padding: {
        sm: 'px-2 py-1',
        md: 'px-4 py-2',
        lg: 'px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
      padding: 'lg',
    },
  },
);


const Input = React.forwardRef(function Input(
  {
    className,
    variant,
    inputSize,
    asChild = false,
    label,
    type = 'text',
    ...props
  },
  ref
) {
  const [inputType, setInputType] = useState(type);
  const [value, setValue] = useState('');
  const toggleInputType = () =>
    setInputType(inputType === 'password' ? 'text' : 'password');
  const Comp = asChild ? Slot : 'input';
  const classes = cn(inputVariants({ variant, inputSize, className }));

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className='flex flex-col space-y-1'>
      {label && (
        <label className='text-sm text-volt-grey-placeholder'>{label}</label>
      )}
      <div className='relative'>
        <Comp
          className={classes}
          ref={ref}
          type={inputType}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {type === 'password' && (
          <button
            type='button'
            onClick={toggleInputType}
            className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'
          >
            {inputType === 'password' ? 'Show' : 'Hide'}
          </button>
        )}
      </div>
    </div>
  );
});
Input.displayName = 'Input';

export { Input, inputVariants };
