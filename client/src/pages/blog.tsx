import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { BlogPost } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function Blog() {
    const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
        queryKey: ["/api/blog-posts"],
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
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-left" style={{paddingLeft: '64px'}}>
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-4" data-testid="blog-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Blog
                        </h1>
                    </div>
                </div>
            </section>

            {/* Blog Posts */}
            <section className="pt-12 pb-4">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg" data-testid="no-blog-posts" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                No blog posts available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <article 
                                    key={post.id}
                                    className="border border-gray-300 rounded-md p-3 hover:shadow-md transition-shadow duration-300 w-4/5" style={{backgroundColor: '#e5e5ff'}}
                                    data-testid={`blog-post-${post.id}`}
                                >
                                    {/* Meta information */}
                                    <div className="flex items-center text-sm text-gray-700 font-medium mb-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <time data-testid={`blog-post-date-${post.id}`}>
                                                {new Date(post.published_date + 'T12:00:00').toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </time>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className={`font-playfair font-bold text-navy hover:text-purple transition-colors duration-200 ${post.title.toLowerCase().includes('an explainer') ? 'italic' : ''}`} style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '21px'}}>
                                        <Link href={`/blog/${post.id}`} data-testid={`blog-post-title-${post.id}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    {/* Tags */}
                                    {post.tags.length > 0 && (
                                        <div className="mb-2">
                                            <div className="flex flex-wrap gap-1">
                                                {post.tags.map((tag) => (
                                                    <span 
                                                        key={tag}
                                                        className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                                                        style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                                        data-testid={`blog-post-tag-${post.id}-${tag.toLowerCase()}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
