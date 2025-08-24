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
                {/* Twelve-pointed star background from production website */}
                <div 
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: 'url(https://www.davidlefkowitz.com/r2-assets/12_point_curved.svg)',
                        backgroundPosition: 'center center',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        zIndex: -1
                    }}
                ></div>
                
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
