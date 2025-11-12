import { useRef, useCallback } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      // Si ya está procesando, ignorar
      if (isProcessingRef.current) {
        return;
      }

      // Limpiar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Marcar como procesando
      isProcessingRef.current = true;

      // Ejecutar después del delay
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        // Liberar después de un tiempo adicional
        setTimeout(() => {
          isProcessingRef.current = false;
        }, delay);
      }, 0);
    },
    [callback, delay]
  );
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 500
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}
