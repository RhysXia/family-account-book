import { FC } from 'react';

const Display: FC<{ display: string }> = ({ display }) => {
  return (
    <div className="h-full w-full bg-slate-500 text-white flex items-center justify-end text-xl font-bold px-2">
      {display}
    </div>
  );
};

export default Display;
