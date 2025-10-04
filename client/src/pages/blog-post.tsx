import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { BlogPost } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function BlogPostPage() {
    const [match, params] = useRoute("/blog/:id");
    const postId = params?.id;

    const { data: post, isLoading, error } = useQuery<BlogPost>({
        queryKey: ["/api/blog-posts", postId],
        enabled: !!postId,
    });

    const { data: navigation } = useQuery({
        queryKey: ["/api/blog-posts", postId, "navigation"],
        queryFn: async () => {
            const response = await fetch(`/api/blog-posts/${postId}/navigation`);
            if (!response.ok) throw new Error('Failed to fetch navigation');
            return response.json();
        },
        enabled: !!postId,
    });

    // Scroll to top when component loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [postId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-3xl font-playfair font-bold text-navy mb-4" data-testid="post-not-found-title">
                            Post Not Found
                        </h1>
                        <p className="text-gray-600 mb-8">
                            The blog post you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href="/blog">
                            <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium transition-colors duration-200" data-testid="back-to-blog-link">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Header */}
            <section className="py-12 relative" style={{backgroundColor: '#e5e5ff'}}>
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
                
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Navigation Links at Top */}
                    <div className="mb-8 flex items-center gap-6">
                        <Link href="/blog">
                            <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium transition-colors duration-200" data-testid="back-to-blog-link">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </a>
                        </Link>
                        {navigation?.previous && (
                            <Link href={`/blog/${navigation.previous.slug || navigation.previous.id}`}>
                                <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium transition-colors duration-200" data-testid="previous-post-link">
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous Blogpost
                                </a>
                            </Link>
                        )}
                        {navigation?.next && (
                            <Link href={`/blog/${navigation.next.slug || navigation.next.id}`}>
                                <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium transition-colors duration-200" data-testid="next-post-link">
                                    Next Blogpost
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </a>
                            </Link>
                        )}
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center text-sm text-gray-800 font-medium mb-6">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <time data-testid="post-date">
                                {new Date(post.published_date + 'T12:00:00').toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>
                        <span className="mx-2">•</span>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span data-testid="post-read-time">
                                {post.read_time} min read
                            </span>
                        </div>
                    </div>
                    
                </div>
                
                {/* Test container outside centered wrapper */}
                <div 
                    className="h-12 mb-4"
                    style={{
                        border: '2px solid blue',
                        marginLeft: 'calc((100vw - 768px) / 2 + 24px)',
                        marginRight: '340px'
                    }}>
                </div>
                
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Title */}
                    <h1 
                        className={`text-4xl lg:text-5xl font-playfair font-bold text-navy md:pr-24 mt-16 ${post.title.toLowerCase().includes('an explainer') ? 'italic' : ''}`} 
                        data-testid="post-title" 
                        style={{
                            fontFamily: 'Times, "Times New Roman", Palatino, serif',
                            lineHeight: '1.25',
                            border: '2px solid red'
                        }}>
                        {post.title}
                    </h1>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span 
                                        key={tag}
                                        className="inline-block bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full"
                                        data-testid={`post-tag-${tag.toLowerCase()}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Content */}
            <section className="pt-3 pb-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none">
                        {/* Excerpt or Special Comment */}
                        <div className="text-gray-700 mb-6 p-6 border border-gray-300 border-l-4 border-purple shadow-lg" data-testid="post-excerpt" style={{backgroundColor: 'white', fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '21px', lineHeight: '1.43', borderRadius: '0.5rem'}}>
                            <div style={{lineHeight: '1.43'}}>
                                <span style={{fontSize: '31.5px', fontFamily: 'Times, "Times New Roman", Palatino, serif', lineHeight: '0.91', verticalAlign: 'baseline'}}>&ldquo;</span>
                                <span dangerouslySetInnerHTML={{__html: (post.comment && post.comment.trim() ? post.comment : post.excerpt) || ''}} />
                                <span style={{fontSize: '31.5px', fontFamily: 'Times, "Times New Roman", Palatino, serif', lineHeight: '0.91', verticalAlign: 'baseline'}}>&rdquo;</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-gray-700 leading-relaxed" data-testid="post-content" style={{lineHeight: '1.6', fontFamily: 'Times, "Times New Roman", Palatino, serif', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem'}}>
                            {(() => {
                                // Apply paragraph formatting with consistent indentation
                                // First try to split by double newlines
                                let paragraphs = post.content.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
                                
                                // If that gives only one paragraph, try splitting by single newlines
                                if (paragraphs.length === 1) {
                                    paragraphs = post.content.split(/\n/).map(p => p.trim()).filter(p => p.length > 0);
                                }
                                
                                return paragraphs.map((paragraph, index) => (
                                    <p 
                                        key={index}
                                        className="mb-1"
                                        style={{
                                            fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                            fontWeight: '500',
                                            textIndent: '36px'
                                        }}
                                        dangerouslySetInnerHTML={{__html: paragraph}}
                                    />
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Comments Section - Placeholder for Disqus */}
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <h3 className="text-2xl font-playfair font-bold text-navy mb-6" data-testid="comments-title">
                            Comments
                        </h3>
                        <div className="border border-gray-300 rounded-xl p-8 text-center" data-testid="comments-placeholder" style={{backgroundColor: '#e5e5ff'}}>
                            <p className="text-gray-600">
                                Comments will be integrated with Disqus in a future update.
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-6">
                            <Link href="/blog">
                                <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium text-lg transition-colors duration-200" data-testid="back-to-blog-bottom">
                                    Back to All Posts
                                </a>
                            </Link>
                            {navigation?.previous && (
                                <Link href={`/blog/${navigation.previous.slug || navigation.previous.id}`}>
                                    <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium text-lg transition-colors duration-200" data-testid="previous-post-link-bottom">
                                        <ChevronLeft className="mr-1 h-5 w-5" />
                                        Previous Blogpost
                                    </a>
                                </Link>
                            )}
                            {navigation?.next && (
                                <Link href={`/blog/${navigation.next.slug || navigation.next.id}`}>
                                    <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium text-lg transition-colors duration-200" data-testid="next-post-link-bottom">
                                        Next Blogpost
                                        <ChevronRight className="ml-1 h-5 w-5" />
                                    </a>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
