'use client';

import { useState, useRef, useEffect } from 'react';

interface LazyIframeProps {
  html: string;
  title: string;
}

export function LazyIframe({ html, title }: LazyIframeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full pt-[56.25%]">
      {isVisible ? (
        <iframe
          srcDoc={html}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          title={title}
        />
      ) : (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100" />
      )}
    </div>
  );
} 