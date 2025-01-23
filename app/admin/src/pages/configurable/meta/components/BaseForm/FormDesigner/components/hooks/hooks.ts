import { useEffect } from 'react';
import Sortable from 'sortablejs';
import type { Container, Field } from '../../types';

interface UseSortableProps {
  containerRef: React.RefObject<HTMLElement>;
  container?: Container;
  onFieldsChange?: (fields: Field[]) => void;
  type: 'container' | 'field';
}

export const useSortable = ({
  containerRef,
  container,
  onFieldsChange,
  type,
}: UseSortableProps) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const options =
      type === 'container'
        ? {
            group: 'containers',
            animation: 150,
            handle: '.container-header',
            draggable: '.container',
            ghostClass: 'sortable-ghost',
          }
        : {
            group: {
              name: 'fields',
              pull: 'clone',
              put: true,
            },
            animation: 150,
            handle: '.field-drag',
            draggable: '.field',
            ghostClass: 'sortable-ghost',
            onAdd: (evt: Sortable.SortableEvent) => {
              // ... field add logic
            },
            onEnd: (evt: Sortable.SortableEvent) => {
              // ... field sort logic
            },
          };

    const sortable = new Sortable(containerRef.current, options);

    return () => {
      sortable.destroy();
    };
  }, [containerRef, container, onFieldsChange, type]);
};
