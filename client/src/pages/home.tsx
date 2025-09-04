import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Trophy, GraduationCap, Music } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Composition, Recording, BlogPost, Profile } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function Home() {
    const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
        queryKey: ["/api/profile", "v2"],
    });

    const { data: compositions = [], isLoading: compositionsLoading } = useQuery<Composition[]>({
        queryKey: ["/api/compositions"],
    });

    const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
        queryKey: ["/api/blog-posts"],
    });

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
                            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-navy leading-tight mb-6" data-testid="hero-name" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                {profile?.name || "David S. Lefkowitz"}
                            </h1>
                        </div>
                        
                        {/* Professional Photo - Centered and Prominent */}
                        <div className="relative inline-block" style={{marginTop: '40px'}}>
                            <div className="relative z-10">
                                <img 
                                    src={profile?.photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"}
                                    alt={profile?.name || "David S. Lefkowitz"}
                                    className="rounded-2xl shadow-2xl w-80 h-80 object-cover mx-auto"
                                    data-testid="hero-photo"
                                />
                            </div>
                        </div>

                        {/* Title and Institution - Below Photo */}
                        <div>
                            <p className="text-xl text-gray-700 mb-2" data-testid="hero-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontWeight: '595'}}>
                                {profile?.title || "Composer, Professor of Music Composition & Theory"}
                            </p>
                            <p className="text-purple" data-testid="hero-institution" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontWeight: '595', fontSize: '21px'}}>
                                {profile?.institution || "UCLA Herb Alpert School of Music"}
                            </p>
                        </div>
                        
                    </div>
                </div>
            </section>


        </div>
    );
}
