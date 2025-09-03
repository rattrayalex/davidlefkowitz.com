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
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [editTitleValue, setEditTitleValue] = useState('');

    const { data: mediaItems = [], isLoading } = useQuery<MediaResponse[]>({
        queryKey: ["/api/media"],
    });

    const handleUploadComplete = (result: { url: string; fileName: string }) => {
        console.log('Upload completed:', result);
        // Refresh the media list
        queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    };

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', itemId);
    };

    const handleDragOver = (e: React.DragEvent, itemId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOver(itemId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDraggedOver(null);
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        
        if (!draggedItem || draggedItem === targetId) {
            setDraggedItem(null);
            setDraggedOver(null);
            return;
        }

        // Find the indices of the dragged and target items
        const draggedIndex = mediaItems.findIndex(item => item.id === draggedItem);
        const targetIndex = mediaItems.findIndex(item => item.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Determine if we need to move up or down
        if (draggedIndex < targetIndex) {
            // Moving down - call move-down multiple times
            for (let i = draggedIndex; i < targetIndex; i++) {
                await fetch(`/api/media/${draggedItem}/move-down`, { method: 'PUT' });
            }
        } else {
            // Moving up - call move-up multiple times  
            for (let i = draggedIndex; i > targetIndex; i--) {
                await fetch(`/api/media/${draggedItem}/move-up`, { method: 'PUT' });
            }
        }

        queryClient.invalidateQueries({ queryKey: ["/api/media"] });
        setDraggedItem(null);
        setDraggedOver(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDraggedOver(null);
    };

    const setCustomOrder = async () => {
        const orderedTitles = [
            "Lefkowitz 1370",
            "Lefkowitz 1312", 
            "Lefkowitz 1351",
            "Lefkowitz-17",
            "Lefkowitz-30",
            "Lefkowitz-31",
            "David Lefkowitz Summer 2013",
            "David S Lefkowitz Hi-Res"
        ];

        try {
            const response = await fetch('/api/media/set-order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titles: orderedTitles })
            });
            
            if (response.ok) {
                queryClient.invalidateQueries({ queryKey: ["/api/media"] });
            }
        } catch (error) {
            console.error('Error setting custom order:', error);
        }
    };

    const updateTitle = async (itemId: string, newTitle: string) => {
        if (newTitle.trim() === '') return;
        
        try {
            const response = await fetch(`/api/media/${itemId}/title`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle.trim() })
            });
            
            if (response.ok) {
                // Force cache refresh and UI update
                await queryClient.invalidateQueries({ queryKey: ["/api/media"] });
                await queryClient.refetchQueries({ queryKey: ["/api/media"] });
                setEditingTitle(null);
                setEditTitleValue('');
                console.log('Title updated successfully to:', newTitle.trim());
            } else {
                console.error('Failed to update title, status:', response.status);
            }
        } catch (error) {
            console.error('Error updating title:', error);
        }
    };

    const startEditingTitle = (itemId: string, currentTitle: string) => {
        setEditingTitle(itemId);
        setEditTitleValue(currentTitle);
    };

    const handleTitleKeyPress = (e: React.KeyboardEvent, itemId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateTitle(itemId, editTitleValue);
        } else if (e.key === 'Escape') {
            setEditingTitle(null);
            setEditTitleValue('');
        }
    };

    const handleTitleBlur = (itemId: string) => {
        if (editTitleValue.trim() !== '') {
            updateTitle(itemId, editTitleValue);
        } else {
            setEditingTitle(null);
            setEditTitleValue('');
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
                        
                        {/* Upload Button */}
                        <div className="mt-8 flex justify-center">
                            <ObjectUploader
                                onComplete={handleUploadComplete}
                                buttonClassName="bg-navy hover:bg-navy-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                            </ObjectUploader>
                        </div>
                        
                        {mediaItems.length > 1 && (
                            <p className="mt-4 text-gray-600 text-sm">Click photo titles to edit them • Drag photos to reorder</p>
                        )}
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
                                className={`snap-center px-4 py-6 relative cursor-move transition-all duration-200 ${
                                    draggedItem === item.id ? 'opacity-50' : ''
                                } ${
                                    draggedOver === item.id ? 'bg-blue-50' : ''
                                }`}
                                style={{ minHeight: '100vh' }}
                                data-testid={`media-item-${index}`}
                                draggable={mediaItems.length > 1}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, item.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="max-w-6xl mx-auto text-center flex flex-col justify-center min-h-full">
                                    {/* Photo Title - Editable */}
                                    <div className="mb-2">
                                        {editingTitle === item.id ? (
                                            <input
                                                type="text"
                                                value={editTitleValue}
                                                onChange={(e) => setEditTitleValue(e.target.value)}
                                                onKeyDown={(e) => handleTitleKeyPress(e, item.id)}
                                                onBlur={() => handleTitleBlur(item.id)}
                                                className="text-lg font-medium text-center bg-white border-2 border-blue-400 rounded px-2 py-1 w-full max-w-sm mx-auto focus:outline-none focus:border-blue-600"
                                                autoFocus
                                                placeholder="Enter title..."
                                                data-testid={`title-input-${index}`}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => startEditingTitle(item.id, item.title)}
                                                className="text-lg font-medium text-gray-800 hover:text-blue-600 hover:bg-gray-50 px-2 py-1 rounded transition-colors cursor-pointer"
                                                data-testid={`title-display-${index}`}
                                            >
                                                {item.title}
                                            </button>
                                        )}
                                    </div>

                                    <img
                                        src={`/public-objects/media/${item.image_url.split('/').pop()}`}
                                        alt={item.alt_text || item.title}
                                        className="max-w-full object-contain mx-auto rounded-lg shadow-lg pointer-events-none"
                                        style={{ 
                                            maxHeight: 'calc(100vh - 120px)',
                                            marginTop: '8px',
                                            marginBottom: '8px'
                                        }}
                                        data-testid={`media-image-${index}`}
                                    />
                                    
                                    {/* Photo credits */}
                                    {item.photo_credits && (
                                        <p 
                                            className="text-gray-600 mt-2 mb-4 pointer-events-none"
                                            style={{ fontSize: '14px' }}
                                            data-testid={`photo-credits-${index}`}
                                        >
                                            {item.photo_credits}
                                        </p>
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