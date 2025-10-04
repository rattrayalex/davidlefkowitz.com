import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const queryClient = useQueryClient();
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [draggedOver, setDraggedOver] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [activeSection, setActiveSection] = useState<'photos' | 'reviews'>('photos');
    const [photosFullyScrolled, setPhotosFullyScrolled] = useState(false);
    const [photoSectionInView, setPhotoSectionInView] = useState(false);
    const [scrollingUpFromReviews, setScrollingUpFromReviews] = useState(false);
    
    // Check if we're in Replit development mode
    const isReplitDev = import.meta.env.DEV && (
        window.location.hostname.includes('.replit.dev') || 
        window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('127.0.0.1')
    );

    const { data: mediaItems = [], isLoading } = useQuery<MediaResponse[]>({
        queryKey: ["/api/media"],
        select: (data: MediaResponse[]) => {
            // Filter out photos with "profile" in the title and sort by title
            return [...data]
                .filter(item => !item.title.toLowerCase().includes('profile'))
                .sort((a, b) => a.title.localeCompare(b.title));
        }
    });

    const { data: reviewsData } = useQuery<{ reviews: string[] }>({
        queryKey: ["/api/media/reviews"],
    });

    const photosRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);

    const scrollToPhotos = () => {
        setActiveSection('photos');
        setPhotosFullyScrolled(false);
        // Use setTimeout to ensure state updates before scrolling
        setTimeout(() => {
            photosRef.current?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 10);
    };

    const scrollToReviews = () => {
        setActiveSection('reviews');
        setPhotosFullyScrolled(true); // Allow scrolling when reviews are clicked
        // Use setTimeout to ensure state updates and reviews render before scrolling
        setTimeout(() => {
            if (reviewsRef.current) {
                reviewsRef.current.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // If reviews aren't rendered yet, scroll to bottom
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 50);
    };

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
        
        const trimmedTitle = newTitle.trim();
        
        try {
            const response = await fetch(`/api/media/${itemId}/title`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: trimmedTitle })
            });
            
            if (response.ok) {
                // Clear editing state first
                setEditingTitle(null);
                setEditTitleValue('');
                
                // Force fresh data from server
                await queryClient.refetchQueries({ queryKey: ["/api/media"] });
                console.log('Title updated successfully to:', trimmedTitle);
            } else {
                console.error('Failed to update title, status:', response.status);
                alert('Failed to update title. Please try again.');
            }
        } catch (error) {
            console.error('Error updating title:', error);
            alert('Error updating title. Please try again.');
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
            
            // Check if we've scrolled to the last photo
            const scrollHeight = container.scrollHeight;
            const maxScroll = scrollHeight - containerHeight;
            const isAtBottom = scrollTop >= maxScroll - 10; // 10px threshold
            const isLastPhoto = visibleIndex === mediaItems.length - 1;
            
            if (isAtBottom || isLastPhoto) {
                setPhotosFullyScrolled(true);
            }
            
            // Reset when scrolled back to top of first photo
            if (scrollTop < 50 && visibleIndex === 0) {
                setPhotosFullyScrolled(false);
                setScrollingUpFromReviews(false);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [mediaItems.length]);
    
    // Prevent photo scrolling when hero section is still visible (scrolling down)
    // and force all upward scrolling through photos when coming from reviews
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!containerRef.current || !photosRef.current) return;
            
            const photoRect = photosRef.current.getBoundingClientRect();
            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            
            // Check if mouse is over the photo container
            const isOverContainer = e.clientX >= containerRect.left && 
                                   e.clientX <= containerRect.right && 
                                   e.clientY >= containerRect.top && 
                                   e.clientY <= containerRect.bottom;
            
            // Scrolling down: prevent photo scrolling if hero section is still visible
            if (photoRect.top > 0 && isOverContainer && e.deltaY > 0) {
                e.preventDefault();
                // Scroll the page instead
                window.scrollBy(0, e.deltaY);
                return;
            }
            
            // Scrolling up from reviews: force ALL upward scrolling through photos
            if (scrollingUpFromReviews && e.deltaY < 0) {
                // Always prevent page scroll when scrolling up from reviews
                e.preventDefault();
                
                const isAtFirstPhoto = container.scrollTop <= 0;
                
                if (!isAtFirstPhoto) {
                    // Scroll the photo container upward
                    container.scrollBy({ top: e.deltaY });
                } else {
                    // At first photo, clear flag and allow page scroll
                    setScrollingUpFromReviews(false);
                    // Scroll the page to show hero
                    window.scrollBy(0, e.deltaY);
                }
            }
        };
        
        // Add wheel event listener with passive: false to allow preventDefault
        document.addEventListener('wheel', handleWheel, { passive: false });
        return () => document.removeEventListener('wheel', handleWheel);
    }, [scrollingUpFromReviews]);
    
    // Hide/show footer and manage page scrolling
    useEffect(() => {
        const footer = document.querySelector('footer');
        
        if (activeSection === 'photos' && !photosFullyScrolled) {
            // Hide footer when viewing photos
            if (footer) footer.style.display = 'none';
        } else {
            // Show footer
            if (footer) footer.style.display = '';
        }
        
        // Clean up on unmount
        return () => {
            const footer = document.querySelector('footer');
            if (footer) {
                footer.style.display = '';
            }
        };
    }, [activeSection, photosFullyScrolled]);
    
    // Track when photo section comes into view and handle upward scrolling from reviews
    useEffect(() => {
        let lastScrollTop = 0;
        let hasBeenInReviews = false;
        let hasResetPhotoScroll = false;
        
        const handlePageScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const isScrollingUp = scrollTop < lastScrollTop;
            
            if (photosRef.current) {
                const photoRect = photosRef.current.getBoundingClientRect();
                
                // Check if photo section has reached the top of viewport
                if (photoRect.top <= 0 && photoRect.bottom > 0) {
                    setPhotoSectionInView(true);
                } else {
                    setPhotoSectionInView(false);
                }
                
                // Check if we're in reviews section
                if (reviewsRef.current) {
                    const reviewRect = reviewsRef.current.getBoundingClientRect();
                    if (reviewRect.top < window.innerHeight * 0.8) {
                        hasBeenInReviews = true;
                        hasResetPhotoScroll = false; // Reset flag when entering reviews
                    }
                }
                
                // If we've been in reviews, scrolling up, and photo section bottom is now visible
                if (hasBeenInReviews && isScrollingUp && photoRect.bottom >= window.innerHeight) {
                    if (!scrollingUpFromReviews) {
                        setScrollingUpFromReviews(true);
                        // Snap to photo section and position container at last photo
                        if (photosRef.current && containerRef.current && !hasResetPhotoScroll) {
                            // Ensure photo section is at viewport top
                            photosRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
                            // Position photo container at last photo
                            const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
                            containerRef.current.scrollTop = maxScroll;
                            hasResetPhotoScroll = true;
                        }
                    }
                }
                
                // If we've scrolled back above photos, reset everything
                if (photoRect.top > 0) {
                    setScrollingUpFromReviews(false);
                    hasBeenInReviews = false;
                    hasResetPhotoScroll = false;
                }
            }
            
            lastScrollTop = scrollTop;
        };
        
        window.addEventListener('scroll', handlePageScroll);
        return () => window.removeEventListener('scroll', handlePageScroll);
    }, []);


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
            <section className="pt-20 pb-8 relative" style={{backgroundColor: '#e5e5ff', border: '2px solid red'}}>
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
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-left" style={{paddingLeft: '64px'}}>
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="media-title">
                            Media
                        </h1>

                        {/* Navigation Buttons */}
                        <div className="flex justify-start gap-4 mb-8 mt-12">
                            <button
                                onClick={scrollToPhotos}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                    activeSection === 'photos' 
                                        ? 'bg-navy text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                style={{
                                    border: activeSection === 'photos' ? '1.5px solid white' : '1.5px solid black'
                                }}
                                data-testid="photos-button"
                            >
                                Photos
                            </button>
                            <button
                                onClick={scrollToReviews}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                    activeSection === 'reviews' 
                                        ? 'bg-navy text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                style={{
                                    border: activeSection === 'reviews' ? '1.5px solid white' : '1.5px solid black'
                                }}
                                data-testid="reviews-button"
                            >
                                Reviews
                            </button>
                        </div>
                        
                        {/* Upload Button - Only show in Replit dev mode */}
                        {isReplitDev && (
                            <div className="flex justify-center">
                                <ObjectUploader
                                    onComplete={handleUploadComplete}
                                    buttonClassName="bg-navy hover:bg-navy-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                </ObjectUploader>
                            </div>
                        )}
                        
                        {isReplitDev && mediaItems.length > 1 && (
                            <p className="mt-4 text-gray-600 text-sm">Click photo titles to edit them • Drag photos to reorder</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Permission text - permanently displayed */}
            <div className="text-center py-4" style={{backgroundColor: '#e5e5ff'}}>
                <p className="italic text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                    (Contact David S. Lefkowitz for permission to use photos)
                </p>
            </div>

            {/* Media Gallery with Snap Scroll */}
            <section 
                className="h-screen" 
                ref={photosRef}
                style={{
                    position: (photoSectionInView && activeSection === 'photos' && !photosFullyScrolled) || 
                              (photoSectionInView && scrollingUpFromReviews) ? 'sticky' : 'relative',
                    top: (photoSectionInView && activeSection === 'photos' && !photosFullyScrolled) || 
                         (photoSectionInView && scrollingUpFromReviews) ? 0 : 'auto',
                    zIndex: (photoSectionInView && activeSection === 'photos' && !photosFullyScrolled) || 
                            (photoSectionInView && scrollingUpFromReviews) ? 10 : 'auto'
                }}>

                {/* Scrollable Image Container */}
                <div 
                    ref={containerRef}
                    className="h-screen overflow-y-auto snap-y snap-mandatory"
                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none', border: '3px solid blue'}}
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
                                className={`snap-center px-4 relative cursor-move transition-all duration-200 ${
                                    draggedItem === item.id ? 'opacity-50' : ''
                                } ${
                                    draggedOver === item.id ? 'bg-blue-50' : ''
                                }`}
                                style={{ minHeight: '100vh', paddingTop: '2px', paddingBottom: '8px', border: '2px solid green' }}
                                data-testid={`media-item-${index}`}
                                draggable={mediaItems.length > 1}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, item.id)}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="max-w-6xl mx-auto flex flex-col justify-center min-h-full items-center" style={{border: '2px solid orange'}}>
                                    {/* Image and credit wrapper */}
                                    <div className="relative inline-block">
                                        <img
                                            src={item.image_url}
                                            alt={item.alt_text || item.title}
                                            className="max-w-full object-contain rounded-lg shadow-lg pointer-events-none"
                                            style={{ 
                                                maxHeight: 'calc(100vh - 120px)',
                                                marginTop: '8px',
                                                marginBottom: '8px'
                                            }}
                                            data-testid={`media-image-${index}`}
                                        />
                                        
                                        {/* Photo credits - positioned to align with image left edge */}
                                        {item.photo_credits && (
                                            <p 
                                                className="text-gray-600 mb-4 pointer-events-none italic"
                                                style={{ 
                                                    fontSize: '12px',
                                                    fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                                    marginTop: '0px',
                                                    textAlign: 'left'
                                                }}
                                                data-testid={`photo-credits-${index}`}
                                            >
                                                {item.photo_credits}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </section>

            {/* Reviews Section - integrated into main scroll */}
            {(activeSection === 'reviews' || photosFullyScrolled) && (
            <div ref={reviewsRef} className="px-4 py-6" style={{backgroundColor: '#e5e5ff', border: '2px solid purple'}}>
                <div className="max-w-3xl mx-auto">
                    {reviewsData?.reviews ? (
                        <div className="space-y-8">
                            {reviewsData.reviews.map((review: string, index: number) => {
                                // Split the review text to replace quotation marks
                                const parts = review.split(/(")/g);
                                let quoteCount = 0;
                                
                                return (
                                    <div key={index} className="p-6 border border-gray-300 rounded-xl border-l-4 border-purple shadow-lg" style={{backgroundColor: 'white'}}>
                                        <p className="text-lg leading-relaxed text-gray-800" style={{ fontFamily: 'Times, "Times New Roman", Palatino, serif' }}>
                                            {parts.map((part, i) => {
                                                if (part === '"') {
                                                    quoteCount++;
                                                    // Odd quotes are opening, even are closing
                                                    const isOpening = quoteCount % 2 === 1;
                                                    return (
                                                        <span key={i} style={{fontSize: '31.5px', fontFamily: 'Times, "Times New Roman", Palatino, serif', lineHeight: '0.91', verticalAlign: 'baseline'}}>
                                                            {isOpening ? '\u201C' : '\u201D'}
                                                        </span>
                                                    );
                                                } else {
                                                    return part;
                                                }
                                            })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-600 text-lg">Loading reviews...</p>
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>
    );
}