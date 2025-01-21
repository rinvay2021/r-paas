import React from 'react';
import debounce from 'lodash/debounce';

interface UseElementHeightOptions {
  offset?: number;
  elementId: string;
}

export const useElementHeight = ({ elementId, offset = 0 }: UseElementHeightOptions) => {
  const [height, setHeight] = React.useState<number>(0);

  React.useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const element = document.getElementById(elementId);
      const elementTop = element?.getBoundingClientRect().top || 0;
      setHeight(windowHeight - elementTop - offset);
    };

    const debouncedCalculateHeight = debounce(calculateHeight, 200);

    calculateHeight();
    window.addEventListener('resize', debouncedCalculateHeight);

    return () => {
      window.removeEventListener('resize', debouncedCalculateHeight);
      debouncedCalculateHeight.cancel();
    };
  }, [elementId, offset]);

  return height;
};
