import { useState } from 'react';
import Display from './Display';
import Buttons from './Buttons';
import useConstantFn from '@/hooks/useConstanFn';

const Calculator = () => {
  const [display, setDisplay] = useState('0');

  const [error, setError] = useState(false);
  const [isExec, setExec] = useState(true);

  const handleInput = useConstantFn((v: string) => {
    if (error && v !== 'AC') {
      return;
    }

    if (v === 'AC') {
      setDisplay('0');
      setError(false);
      setExec(false);
      return;
    }
    if (v === 'DEL') {
      setDisplay((prev) => (isExec ? '0' : prev.slice(0, -1) || '0'));
      setError(false);
      setExec(false);
      return;
    }

    if (['÷', 'x', '-', '+'].includes(v)) {
      setExec(false);
      setDisplay((prev) => prev.replace(/(÷|x|-|\+)?$/, v));
      return;
    }

    if (v === '+/-') {
      setDisplay((prev) =>
        /^-/.test(prev) ? prev.replace(/^-/, '') : `-${prev}`,
      );
      return;
    }

    if (v === '=') {
      setDisplay((prev) => {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(prev.replace(/÷/g, '/').replace(/x/g, '*'));
          return result + '';
        } catch (e) {
          setError(true);
          return '表达式错误';
        }
      });
      setExec(true);
      return;
    }

    if (v === '.') {
      setDisplay((prev) =>
        isExec ? '0.' : prev === '0' ? '0.' : prev.replace(/(÷|x|-|\+)?$/, v),
      );
    } else {
      setDisplay((prev) => (isExec ? v : prev === '0' ? v : prev + v));
    }

    setExec(false);
  });

  return (
    <div>
      <div style={{ height: 70 }}>
        <Display display={display} />
      </div>
      <div style={{ height: 300 }}>
        <Buttons onInput={handleInput} />
      </div>
    </div>
  );
};

export default Calculator;
