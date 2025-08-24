import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Trophy, GraduationCap, Music } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Composition, Recording, BlogPost, Profile } from "@shared/schema";

export default function Home() {
    const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
        queryKey: ["/api/profile"],
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
            <section className="relative overflow-hidden py-20" style={{backgroundColor: '#e5e5ff'}}>
                {/* Twelve-pointed star background matching production website */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
                        {/* Twelve-pointed stars */}
                        <g stroke="#c7b8ea" strokeWidth="1" fill="none">
                            {/* Large twelve-pointed star - top left */}
                            <path d="M200,200 L220,180 L240,200 L260,180 L280,200 L300,180 L320,200 L340,220 L320,240 L340,260 L320,280 L340,300 L320,320 L300,340 L280,320 L260,340 L240,320 L220,340 L200,320 L180,340 L160,320 L140,340 L120,320 L100,300 L120,280 L100,260 L120,240 L100,220 L120,200 L140,180 L160,200 L180,180 Z"/>
                            
                            {/* Medium twelve-pointed star - top right */}
                            <path d="M900,150 L915,135 L930,150 L945,135 L960,150 L975,135 L990,150 L1005,165 L990,180 L1005,195 L990,210 L1005,225 L990,240 L975,255 L960,240 L945,255 L930,240 L915,255 L900,240 L885,255 L870,240 L855,255 L840,240 L825,225 L840,210 L825,195 L840,180 L825,165 L840,150 L855,135 L870,150 L885,135 Z"/>
                            
                            {/* Small twelve-pointed star - center */}
                            <path d="M600,350 L610,340 L620,350 L630,340 L640,350 L650,340 L660,350 L670,360 L660,370 L670,380 L660,390 L670,400 L660,410 L650,420 L640,410 L630,420 L620,410 L610,420 L600,410 L590,420 L580,410 L570,420 L560,410 L550,400 L560,390 L550,380 L560,370 L550,360 L560,350 L570,340 L580,350 L590,340 Z"/>
                            
                            {/* Large twelve-pointed star - bottom right */}
                            <path d="M950,550 L970,530 L990,550 L1010,530 L1030,550 L1050,530 L1070,550 L1090,570 L1070,590 L1090,610 L1070,630 L1090,650 L1070,670 L1050,690 L1030,670 L1010,690 L990,670 L970,690 L950,670 L930,690 L910,670 L890,690 L870,670 L850,650 L870,630 L850,610 L870,590 L850,570 L870,550 L890,530 L910,550 L930,530 Z"/>
                            
                            {/* Small twelve-pointed star - left side */}
                            <path d="M150,500 L160,490 L170,500 L180,490 L190,500 L200,490 L210,500 L220,510 L210,520 L220,530 L210,540 L220,550 L210,560 L200,570 L190,560 L180,570 L170,560 L160,570 L150,560 L140,570 L130,560 L120,570 L110,560 L100,550 L110,540 L100,530 L110,520 L100,510 L110,500 L120,490 L130,500 L140,490 Z"/>
                            
                            {/* Connecting lines between stars */}
                            <line x1="320" y1="200" x2="840" y2="150" stroke="#c7b8ea" strokeWidth="0.5"/>
                            <line x1="600" y1="350" x2="200" y2="200" stroke="#c7b8ea" strokeWidth="0.5"/>
                            <line x1="950" y1="550" x2="600" y2="350" stroke="#c7b8ea" strokeWidth="0.5"/>
                            <line x1="150" y1="500" x2="900" y2="150" stroke="#c7b8ea" strokeWidth="0.5"/>
                        </g>
                    </svg>
                </div>
                
                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-8">
                        {/* Main Title */}
                        <div>
                            <h1 className="text-6xl lg:text-7xl font-playfair font-bold text-navy leading-tight mb-6" data-testid="hero-name">
                                {profile?.name || "David S. Lefkowitz"}
                            </h1>
                            <p className="text-xl text-gray-700 font-medium mb-2" data-testid="hero-title">
                                {profile?.title || "Composer, Professor of Music Composition & Theory"}
                            </p>
                            <p className="text-lg text-purple font-medium" data-testid="hero-institution">
                                {profile?.institution || "UCLA Herb Alpert School of Music"}
                            </p>
                        </div>
                        
                        {/* Professional Photo - Centered and Prominent */}
                        <div className="relative inline-block">
                            <div className="relative z-10">
                                <img 
                                    src={profile?.photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"}
                                    alt={profile?.name || "David S. Lefkowitz"}
                                    className="rounded-2xl shadow-2xl w-80 h-80 object-cover mx-auto"
                                    data-testid="hero-photo"
                                />
                            </div>
                        </div>
                        
                        {/* Subtitle */}
                        <div className="max-w-2xl mx-auto">
                            <p className="text-xl text-gray-700 leading-relaxed" data-testid="hero-bio-short">
                                {profile?.bio_short || "Composer, Theorist, and Professor at UCLA"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Works */}
            <section className="py-20" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-playfair font-bold text-navy mb-4" data-testid="featured-compositions-title">
                            Compositions
                        </h2>
                    </div>
                    
                    {compositionsLoading ? (
                        <LoadingSpinner className="py-12" />
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredCompositions.map((composition) => (
                                <div 
                                    key={composition.id} 
                                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                                    data-testid={`composition-card-${composition.id}`}
                                >
                                    <div className="mb-4">
                                        <span className={`inline-block text-white text-sm px-3 py-1 rounded-full font-medium ${
                                            composition.category === 'Chamber Music' ? 'bg-purple' :
                                            composition.category === 'Orchestral' ? 'bg-gold' :
                                            composition.category === 'Solo' ? 'bg-purple' :
                                            composition.category === 'Electronic' ? 'bg-blue-500' :
                                            composition.category === 'Vocal' ? 'bg-red-500' :
                                            'bg-gray-500'
                                        }`} data-testid={`composition-category-${composition.id}`}>
                                            {composition.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-playfair font-semibold text-navy mb-2" data-testid={`composition-title-${composition.id}`}>
                                        {composition.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4" data-testid={`composition-instrumentation-${composition.id}`}>
                                        {composition.instrumentation}
                                    </p>
                                    <p className="text-gray-700 text-sm leading-relaxed" data-testid={`composition-description-${composition.id}`}>
                                        {composition.description.substring(0, 120)}...
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <span className="text-sm text-gray-500" data-testid={`composition-year-${composition.id}`}>
                                            {composition.year}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link href="/compositions">
                            <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium text-lg transition-colors duration-200" data-testid="link-view-all-compositions">
                                View All Compositions 
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Recent Posts */}
            <section className="py-20" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-playfair font-bold text-navy mb-4" data-testid="recent-thoughts-title">
                            Blog
                        </h2>
                    </div>
                    
                    {postsLoading ? (
                        <LoadingSpinner className="py-12" />
                    ) : recentPosts.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            {recentPosts.map((post) => (
                                <article 
                                    key={post.id} 
                                    className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
                                    data-testid={`blog-post-card-${post.id}`}
                                >
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <time data-testid={`blog-post-date-${post.id}`}>
                                            {new Date(post.published_date).toLocaleDateString()}
                                        </time>
                                        <span className="mx-2">•</span>
                                        <span data-testid={`blog-post-read-time-${post.id}`}>
                                            {post.read_time} min read
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-playfair font-semibold text-navy mb-4 hover:text-purple transition-colors duration-200">
                                        <Link href={`/blog/${post.id}`}>
                                            <a data-testid={`blog-post-title-${post.id}`}>
                                                {post.title}
                                            </a>
                                        </Link>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-6" data-testid={`blog-post-excerpt-${post.id}`}>
                                        {post.excerpt}
                                    </p>
                                    <Link href={`/blog/${post.id}`}>
                                        <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium transition-colors duration-200" data-testid={`blog-post-read-more-${post.id}`}>
                                            Read More 
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </a>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600" data-testid="no-blog-posts">
                                No blog posts available at the moment.
                            </p>
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link href="/blog">
                            <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium text-lg transition-colors duration-200" data-testid="link-view-all-posts">
                                View All Posts 
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </a>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
