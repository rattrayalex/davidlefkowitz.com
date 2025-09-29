import React, { useState, useEffect, useRef } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    placeholder?: string;
    threshold?: number;
}

export default function LazyImage({ 
    src, 
    alt, 
    placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0f0f0'/%3E%3C/svg%3E",
    threshold = 0.1,
    className = "",
    onLoad,
    onError,
    ...props 
}: LazyImageProps) {
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Clean up previous observer if it exists
        if (observerRef.current && imageRef) {
            observerRef.current.unobserve(imageRef);
        }

        if (!imageRef) return;

        // Create new observer for lazy loading
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Image is in viewport, ensure it's using the real src
                        setImageSrc(src);
                        if (observerRef.current && imageRef) {
                            observerRef.current.unobserve(imageRef);
                        }
                    }
                });
            },
            { threshold }
        );

        observerRef.current.observe(imageRef);

        return () => {
            if (observerRef.current && imageRef) {
                observerRef.current.unobserve(imageRef);
            }
        };
    }, [imageRef, src, threshold]);

    // Update imageSrc when src prop changes
    useEffect(() => {
        setImageSrc(src);
    }, [src]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={className}
            onLoad={onLoad}
            onError={onError}
            {...props}
        />
    );
}