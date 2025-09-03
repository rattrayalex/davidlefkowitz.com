import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown, Upload } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Media } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

// Define the API response type for media
interface MediaResponse {
    id: string;
    title: string;
    description: string;
    image_url: string;
    alt_text: string;
    category: string;
    date_taken: string;
    photo_credits: string;
    display_order: number;
}

export default function MediaPage() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showUpChevron, setShowUpChevron] = useState(false);
    const [showDownChevron, setShowDownChevron] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const queryClient = useQueryClient();
    const [isReordering, setIsReordering] = useState(false);

    const { data: mediaItems = [], isLoading } = useQuery<MediaResponse[]>({
        queryKey: ["/api/media"],
    });

    const handleUploadComplete = (result: { url: string; fileName: string }) => {
        console.log('Upload completed:', result);
        // Refresh the media list
        queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    };

    const moveItemUp = async (itemId: string) => {
        try {
            const response = await fetch(`/api/media/${itemId}/move-up`, {
                method: 'PUT',
            });
            if (response.ok) {
                queryClient.invalidateQueries({ queryKey: ["/api/media"] });
            }
        } catch (error) {
            console.error('Error moving item up:', error);
        }
    };

    const moveItemDown = async (itemId: string) => {
        try {
            const response = await fetch(`/api/media/${itemId}/move-down`, {
                method: 'PUT',
            });
            if (response.ok) {
                queryClient.invalidateQueries({ queryKey: ["/api/media"] });
            }
        } catch (error) {
            console.error('Error moving item down:', error);
        }
    };

    // Get unique photo credits text from all media items
    const photoCredits = mediaItems.length > 0 ? mediaItems.find(item => item.photo_credits)?.photo_credits || "" : "";

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || mediaItems.length === 0) return;

            const container = containerRef.current;
            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;

            // Find the currently visible image
            let visibleIndex = 0;
            imageRefs.current.forEach((ref, index) => {
                if (ref) {
                    const rect = ref.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    // Check if image is in the center of the viewport
                    if (rect.top <= containerRect.top + containerHeight / 2 && 
                        rect.bottom >= containerRect.top + containerHeight / 2) {
                        visibleIndex = index;
                    }
                }
            });

            setCurrentImageIndex(visibleIndex);
            setShowUpChevron(visibleIndex > 0);
            setShowDownChevron(visibleIndex < mediaItems.length - 1);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [mediaItems.length]);

    const scrollToImage = (index: number) => {
        const targetRef = imageRefs.current[index];
        if (targetRef && containerRef.current) {
            targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const scrollUp = () => {
        if (currentImageIndex > 0) {
            scrollToImage(currentImageIndex - 1);
        }
    };

    const scrollDown = () => {
        if (currentImageIndex < mediaItems.length - 1) {
            scrollToImage(currentImageIndex + 1);
        }
    };

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
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="media-title">
                            Media
                        </h1>
                        
                        {/* Upload and Reorder Buttons */}
                        <div className="mt-8 flex justify-center gap-4">
                            <ObjectUploader
                                onComplete={handleUploadComplete}
                                buttonClassName="bg-navy hover:bg-navy-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                            </ObjectUploader>
                            
                            {mediaItems.length > 1 && (
                                <button
                                    onClick={() => setIsReordering(!isReordering)}
                                    className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                        isReordering 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                                    }`}
                                    data-testid="toggle-reorder"
                                >
                                    {isReordering ? 'Done Reordering' : 'Reorder Photos'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Media Gallery with Snap Scroll */}
            <section className="relative">
                {/* Up Chevron */}
                {showUpChevron && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-20 z-20">
                        <button
                            onClick={scrollUp}
                            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200"
                            data-testid="scroll-up-button"
                        >
                            <ChevronUp className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                )}

                {/* Down Chevron */}
                {showDownChevron && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 translate-y-16 z-20">
                        <button
                            onClick={scrollDown}
                            className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all duration-200"
                            data-testid="scroll-down-button"
                        >
                            <ChevronDown className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                )}

                {/* Scrollable Image Container */}
                <div 
                    ref={containerRef}
                    className="h-screen overflow-y-auto snap-y snap-mandatory"
                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                >
                    <style>{`
                        .h-screen::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    
                    {mediaItems.length === 0 ? (
                        <div className="h-screen flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-600 text-lg mb-4" data-testid="no-media">No media available yet.</p>
                                <p className="text-gray-500">Upload your first image using the button above!</p>
                            </div>
                        </div>
                    ) : (
                        mediaItems.map((item, index) => (
                            <div 
                                key={item.id}
                                ref={(el) => imageRefs.current[index] = el}
                                className="snap-center px-4 py-6 relative"
                                style={{ minHeight: '100vh' }}
                                data-testid={`media-item-${index}`}
                            >
                                <div className="max-w-6xl mx-auto text-center flex flex-col justify-center min-h-full">
                                    {/* Up chevron */}
                                    {isReordering && index > 0 && (
                                        <button
                                            onClick={() => moveItemUp(item.id)}
                                            className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10"
                                            data-testid={`move-up-${index}`}
                                        >
                                            <ChevronUp className="w-6 h-6" />
                                        </button>
                                    )}
                                    
                                    <img
                                        src={`/public-objects/media/${item.image_url.split('/').pop()}`}
                                        alt={item.alt_text || item.title}
                                        className="max-w-full object-contain mx-auto rounded-lg shadow-lg"
                                        style={{ 
                                            maxHeight: 'calc(100vh - 96px)',
                                            marginTop: '24px',
                                            marginBottom: '8px'
                                        }}
                                        data-testid={`media-image-${index}`}
                                    />
                                    
                                    {/* Photo credits */}
                                    {item.photo_credits && (
                                        <p 
                                            className="text-gray-600 mt-2 mb-4"
                                            style={{ fontSize: '14px' }}
                                            data-testid={`photo-credits-${index}`}
                                        >
                                            {item.photo_credits}
                                        </p>
                                    )}

                                    {/* Down chevron */}
                                    {isReordering && index < mediaItems.length - 1 && (
                                        <button
                                            onClick={() => moveItemDown(item.id)}
                                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10"
                                            data-testid={`move-down-${index}`}
                                        >
                                            <ChevronDown className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </section>
        </div>
    );
}