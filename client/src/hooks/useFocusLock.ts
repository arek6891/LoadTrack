import { useEffect, useRef } from 'react';

export const useFocusLock = (isActive: boolean = true) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleFocus = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        // Małe opóźnienie, aby nie blokować innych akcji (np. kliknięcia w przycisk)
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };

    // Przywracaj fokus po kliknięciu gdziekolwiek poza elementami interaktywnymi
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isButton = target.closest('button');
      const isInput = target.closest('input') && target !== inputRef.current;
      const isLink = target.closest('a');

      if (!isButton && !isInput && !isLink) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('click', handleClick);
    // Opcjonalnie: przywracaj po powrocie do karty
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isActive]);

  return inputRef;
};
