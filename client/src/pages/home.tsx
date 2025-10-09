import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Trophy, GraduationCap, Music } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Composition, Recording, BlogPost, Profile } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function Home() {
    const [logos, setLogos] = useState<{ [key: string]: string }>({});
    
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
    
    useEffect(() => {
        // Fetch logos from API
        fetch('/api/logos')
            .then(res => res.json())
            .then(data => {
                const logoMap: { [key: string]: string } = {};
                data.forEach((item: { platform: string, path: string }) => {
                    logoMap[item.platform] = item.path;
                });
                setLogos(logoMap);
            })
            .catch(error => console.error("Error fetching logos:", error));
    }, []);

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Spotify and YouTube MiniButtons - Below header, aligned with "David S. Lefkowitz" text */}
            <section style={{backgroundColor: '#e5e5ff', paddingTop: '0px', paddingBottom: '0px'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8" style={{
                        border: '2.5px solid hsl(262.1, 83.3%, 57.8%)',
                        borderRadius: '0.5rem',
                        padding: '0px 20px',
                        width: 'fit-content',
                        backgroundColor: 'white'
                    }}>
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
                            <div style={{
                                height: '40px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <img 
                                    src="/api/media-cache/logo_youtube_minibutton_811dfb93.png" 
                                    alt="Listen on YouTube" 
                                    className="h-14 w-auto"
                                    style={{
                                        marginTop: '-8px',
                                        marginBottom: '-8px'
                                    }}
                                />
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* Hero Section */}
            <section className="relative overflow-visible pt-8 pb-8" style={{backgroundColor: '#e5e5ff', minHeight: '800px'}}>
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
            </section>

            {/* Latest Release Box - Above mini buttons */}
            <section className="pb-2" style={{backgroundColor: '#e5e5ff', paddingTop: '22px'}}>
                <div className="flex justify-center px-4">
                    <div style={{
                        backgroundColor: 'white',
                        border: '2.5px solid hsl(262.1, 83.3%, 57.8%)',
                        borderRadius: '1rem',
                        padding: '12px 30px',
                        maxWidth: '500px',
                        textAlign: 'center'
                    }}>
                        {/* Title */}
                        <h3 className="font-semibold mb-2" style={{
                            fontFamily: 'Times, "Times New Roman", Palatino, serif', 
                            fontSize: '1.75rem'
                        }}>
                            Preludes and Fugues for Piano
                        </h3>
                        
                        {/* Streaming Links */}
                        <div className="flex justify-center gap-6">
                            {/* Spotify Link */}
                            <a 
                                href="https://open.spotify.com/album/1AXDnGNFGtceS4zGvmLn8H"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 hover:opacity-80 transition-opacity"
                                style={{
                                    backgroundColor: '#e8e8ff',
                                    border: '2.5px solid hsl(262.1, 83.3%, 57.8%)',
                                    borderRadius: '8px',
                                    width: '150px',
                                    minHeight: '80px'
                                }}
                            >
                                <span className="text-center font-semibold" style={{
                                    fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                    fontSize: '1.75rem',
                                    lineHeight: '1',
                                    marginBottom: '4px'
                                }}>
                                    Listen on
                                </span>
                                {logos["Spotify"] ? (
                                    <img 
                                        src={logos["Spotify"]} 
                                        alt="Spotify logo"
                                        style={{ 
                                            maxHeight: '30px', 
                                            maxWidth: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <span className="text-center text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        Spotify
                                    </span>
                                )}
                            </a>
                            
                            {/* YouTube Link */}
                            <a 
                                href="https://youtube.com/playlist?list=PL1WjDUvuhzW9pgsYIJhDD9i374wjGNkKi"
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 hover:opacity-80 transition-opacity"
                                style={{
                                    backgroundColor: '#e8e8ff',
                                    border: '2.5px solid hsl(262.1, 83.3%, 57.8%)',
                                    borderRadius: '8px',
                                    width: '150px',
                                    minHeight: '80px'
                                }}
                            >
                                <span className="text-center font-semibold" style={{
                                    fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                    fontSize: '1.75rem',
                                    lineHeight: '1',
                                    marginBottom: '4px'
                                }}>
                                    Listen on
                                </span>
                                {logos["YouTube"] ? (
                                    <img 
                                        src={logos["YouTube"]} 
                                        alt="YouTube logo"
                                        style={{ 
                                            maxHeight: '30px', 
                                            maxWidth: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <span className="text-center text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        YouTube
                                    </span>
                                )}
                            </a>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}
