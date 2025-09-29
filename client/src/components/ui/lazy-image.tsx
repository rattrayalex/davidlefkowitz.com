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
    ...props 
}: LazyImageProps) {
    const [imageSrc, setImageSrc] = useState<string>(placeholder);
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!imageRef) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(src);
                        observer.unobserve(imageRef);
                    }
                });
            },
            { threshold }
        );

        observer.observe(imageRef);

        return () => {
            if (imageRef) {
                observer.unobserve(imageRef);
            }
        };
    }, [imageRef, src, threshold]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={() => setIsLoaded(true)}
            {...props}
        />
    );
}