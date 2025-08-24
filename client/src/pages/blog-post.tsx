import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
    const [match, params] = useRoute("/blog/:id");
    const postId = params?.id;

    const { data: post, isLoading, error } = useQuery<BlogPost>({
        queryKey: ["/api/blog-posts", postId],
        enabled: !!postId,
    });

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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
            <section className="py-12" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back to Blog Link */}
                    <div className="mb-8">
                        <Link href="/blog">
                            <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium transition-colors duration-200" data-testid="back-to-blog-link">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </a>
                        </Link>
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center text-sm text-gray-600 mb-6">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <time data-testid="post-date">
                                {new Date(post.published_date).toLocaleDateString('en-US', {
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

                    {/* Title */}
                    <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-navy mb-3" data-testid="post-title">
                        {post.title}
                    </h1>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="mb-6">
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
            <section className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="prose prose-lg max-w-none">
                        {/* Comment Box */}
                        {post.comment && (
                            <div className="text-xl text-gray-700 leading-relaxed mb-8 p-6 border border-gray-300 rounded-xl border-l-4 border-purple" data-testid="post-comment" style={{backgroundColor: '#e5e5ff'}}>
                                {post.comment}
                            </div>
                        )}

                        {/* Content */}
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid="post-content">
                            {post.content}
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
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                        <Link href="/blog">
                            <a className="inline-flex items-center text-purple hover:text-purple-700 font-medium text-lg transition-colors duration-200" data-testid="back-to-blog-bottom">
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Back to All Posts
                            </a>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
