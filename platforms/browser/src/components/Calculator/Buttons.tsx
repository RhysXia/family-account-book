import clsx from 'clsx';
import { FC, MouseEvent, useCallback } from 'react';

const commonClassNames =
  'flex items-center justify-center cursor-pointer w-1/4 h-1/5 font-bold text-black transition-all text-xl';

const numberClassNames = clsx(
  commonClassNames,
  'bg-stone-300 hover:bg-stone-200',
);

const operationClassNames = clsx(
  commonClassNames,
  'bg-orange-400 hover:bg-orange-300',
);

const Buttons: FC<{ onInput: (v: string) => void }> = ({ onInput }) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const value = el.innerText;
      onInput(value);
    },
    [onInput],
  );

  return (
    <div
      onClick={handleClick}
      className="flex items-center flex-wrap w-full h-full divide-x divide-y"
    >
      <div className={numberClassNames}>AC</div>
      <div className={numberClassNames}>+/-</div>
      <div className={numberClassNames}>DEL</div>
      <div className={operationClassNames}>÷</div>
      <div className={numberClassNames}>7</div>
      <div className={numberClassNames}>8</div>
      <div className={numberClassNames}>9</div>
      <div className={operationClassNames}>x</div>
      <div className={numberClassNames}>4</div>
      <div className={numberClassNames}>5</div>
      <div className={numberClassNames}>6</div>
      <div className={operationClassNames}>-</div>
      <div className={numberClassNames}>1</div>
      <div className={numberClassNames}>2</div>
      <div className={numberClassNames}>3</div>
      <div className={operationClassNames}>+</div>
      <div className={clsx(numberClassNames, 'w-1/2')}>0</div>
      <div className={numberClassNames}>.</div>
      <div className={operationClassNames}>=</div>
    </div>
  );
};

export default Buttons;
