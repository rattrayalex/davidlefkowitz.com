import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Recording } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

// Component for individual recording tile with measured overlay box
function RecordingTile({ recording }: { recording: Recording }) {
    const tileRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
    const [showOverlay, setShowOverlay] = useState(false);

    const calculateOverlay = () => {
        if (!tileRef.current || !titleRef.current || !imageContainerRef.current) return;

        const tileRect = tileRef.current.getBoundingClientRect();
        const titleRect = titleRef.current.getBoundingClientRect();
        const imgRect = imageContainerRef.current.getBoundingClientRect();

        // Calculate positions relative to the tile
        const titleTopRelative = titleRect.top - tileRect.top;
        const imgLeftRelative = imgRect.left - tileRect.left;
        const imgRightRelative = tileRect.right - imgRect.right;
        const imgBottomRelative = imgRect.bottom - tileRect.top;

        // Calculate the margins (distance from image to box edges)
        const leftMargin = imgLeftRelative / 2;
        const rightMargin = imgRightRelative / 2;
        
        // Calculate height to extend past image bottom by same margin
        const boxTop = titleTopRelative / 2;
        const boxHeight = (imgBottomRelative - boxTop) + leftMargin;
        
        setOverlayStyle({
            position: 'absolute',
            top: `${boxTop}px`,
            left: `${leftMargin}px`,
            right: `${rightMargin}px`,
            height: `${boxHeight}px`,
            border: '1px solid #6B46C1',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1
        });
        setShowOverlay(true);
    };

    useEffect(() => {
        // Initial calculation
        const timer = setTimeout(calculateOverlay, 100);

        // Recalculate on window resize
        const handleResize = () => calculateOverlay();
        window.addEventListener('resize', handleResize);

        // Observe size changes
        const resizeObserver = new ResizeObserver(() => calculateOverlay());
        if (tileRef.current) resizeObserver.observe(tileRef.current);
        if (imageContainerRef.current) resizeObserver.observe(imageContainerRef.current);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div 
            ref={tileRef}
            key={recording.id}
            className="border border-purple rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 relative" 
            style={{backgroundColor: '#e5e5ff'}}
            data-testid={`recording-${recording.id}`}
        >
            {/* Overlay Box */}
            {showOverlay && recording.album_cover && (
                <div style={overlayStyle} />
            )}

            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 
                    ref={titleRef}
                    className="text-xl font-playfair font-semibold text-navy mb-4 text-center" 
                    data-testid={`recording-title-${recording.id}`}
                >
                    {recording.title}
                </h3>

                {/* Album Cover */}
                {recording.album_cover && (
                    <div 
                        ref={imageContainerRef}
                        className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden mb-4 rounded-lg"
                    >
                        <img 
                            src={recording.album_cover}
                            alt={recording.title}
                            className="w-full h-full object-cover"
                            data-testid={`recording-cover-${recording.id}`}
                            onLoad={calculateOverlay}
                        />
                    </div>
                )}

                {/* Label */}
                {recording.label && (
                    recording.label_url ? (
                        <a 
                            href={recording.label_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple hover:text-purple-700 text-center block underline transition-colors duration-200"
                            data-testid={`recording-label-${recording.id}`}
                        >
                            {recording.label}
                        </a>
                    ) : (
                        <p className="text-gray-700 text-center" data-testid={`recording-label-${recording.id}`}>
                            {recording.label}
                        </p>
                    )
                )}
            </div>
        </div>
    );
}

export default function Recordings() {
    const { data: recordings = [], isLoading } = useQuery<Recording[]>({
        queryKey: ["/api/recordings"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Hero Section */}
            <section className="py-20 relative" style={{backgroundColor: '#e5e5ff'}}>
                {/* 12-pointed star decoration */}
                <div 
                    className="absolute -top-0 right-4 opacity-100 pointer-events-none hidden md:block"
                    style={{
                        backgroundImage: `url(${twelvePointStarSvg})`,
                        backgroundPosition: 'center center', 
                        backgroundSize: '300px 300px',
                        backgroundRepeat: 'no-repeat',
                        width: '300px',
                        height: '300px',
                        zIndex: 0,
                        filter: 'saturate(400%)'
                    }}
                ></div>
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="recordings-title">
                            Recordings
                        </h1>
                    </div>
                </div>
            </section>

            {/* Recordings Grid */}
            <section className="py-20" style={{position: 'relative'}}>
                {/* Instruction Text - positioned absolutely halfway */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{position: 'absolute', top: '-40px', left: '0', right: '0'}}>
                    <p className="text-gray-600 text-left font-playfair italic" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '21px'}}>
                        (Click on album image for more information.)
                    </p>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {recordings.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg" data-testid="no-recordings">
                                No recordings available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {recordings.map((recording) => (
                                <RecordingTile key={recording.id} recording={recording} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
