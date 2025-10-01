import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Trophy, GraduationCap, Music } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Composition, Recording, BlogPost, Profile } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function Home() {
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ["/api/profile"],
        queryFn: async () => {
            const response = await fetch("/api/profile");
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });


    const { data: compositionData, isLoading: compositionsLoading } = useQuery<{ compositions: Composition[], pagination: any }>({
        queryKey: ["/api/compositions", 1],
        queryFn: async () => {
            const response = await fetch("/api/compositions?page=1&limit=50");
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        },
    });

    const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
        queryKey: ["/api/blog-posts"],
    });

    const compositions = compositionData?.compositions || [];
    const featuredCompositions = compositions.slice(0, 3);
    const recentPosts = posts.slice(0, 2);

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-visible pt-16 pb-8" style={{backgroundColor: '#e5e5ff', minHeight: '800px'}}>
                {/* Twelve-pointed star background from production website */}
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url(${twelvePointStarSvg})`,
                        backgroundPosition: 'center center', 
                        backgroundSize: '800px 800px',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 0,
                        filter: 'saturate(300%)'
                    }}
                ></div>
                
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-8 mt-6">
                        {/* Main Title */}
                        <div style={{marginTop: '80px'}}>
                            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-navy leading-tight mb-3" data-testid="hero-name" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                {(profile as any)?.name}
                            </h1>
                        </div>
                        
                        {/* Professional Photo - Centered and Prominent */}
                        <div className="relative inline-block" style={{marginTop: '18px'}}>
                            <div className="relative z-10">
                                <img 
                                    src={(profile as any)?.photo_url}
                                    alt={(profile as any)?.name}
                                    className="rounded-2xl shadow-2xl w-96 h-96 object-cover mx-auto"
                                    data-testid="hero-photo"
                                    onLoad={() => console.log("✅ Home image loaded:", (profile as any)?.photo_url)}
                                    onError={(e) => console.error("❌ Home image failed:", e.currentTarget.src)}
                                />
                            </div>
                        </div>

                        {/* Title and Institution - Below Photo */}
                        <div>
                            <p className="text-xl text-gray-700 mb-2" data-testid="hero-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontWeight: '595'}}>
                                {(profile as any)?.title}
                            </p>
                            <p className="text-purple" data-testid="hero-institution" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontWeight: '595', fontSize: '21px'}}>
                                {(profile as any)?.institution}
                            </p>
                        </div>
                        
                    </div>
                </div>
                {/* Spotify and YouTube MiniButtons - positioned absolutely to not affect layout */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8" style={{ bottom: '-36px' }}>
                    <a 
                        href="https://open.spotify.com/playlist/6RDB9qiiRD1BR753a953Dx" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                    >
                        <img 
                            src="/api/media-cache/logo_spotify_minibutton_bdf3c836.png" 
                            alt="Listen on Spotify" 
                            className="h-10 w-auto"
                        />
                    </a>
                    <a 
                        href="https://www.youtube.com/channel/UCD3hPTS-8nSSXptFcXsnEAw" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                    >
                        <img 
                            src="/api/media-cache/logo_youtube_minibutton_811dfb93.png" 
                            alt="Listen on YouTube" 
                            className="h-12 w-auto"
                        />
                    </a>
                </div>
            </section>


        </div>
    );
}
