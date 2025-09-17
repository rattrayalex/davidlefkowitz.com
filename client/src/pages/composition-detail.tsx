import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music, Clock, Calendar, Users, ExternalLink } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface CompositionDetailResponse {
    id: string;
    slug?: string;
    title: string;
    instrumentation: string;
    ensemble: string;
    year: number;
    category: string;
    duration: string;
    premiere_info: string;
    publisher: string;
    recording: string;
}

export default function CompositionDetail() {
    const { slug } = useParams();
    
    const { data: composition, isLoading } = useQuery<CompositionDetailResponse>({
        queryKey: [`/api/compositions/${slug}`],
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!composition) {
        return (
            <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link href="/compositions">
                        <a className="inline-flex items-center text-purple hover:text-purple-dark mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Compositions
                        </a>
                    </Link>
                    <h1 className="text-3xl font-playfair font-bold text-navy mb-4">
                        Composition Not Found
                    </h1>
                    <p className="text-gray-600">
                        The composition you're looking for doesn't exist or has been removed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Hero Section */}
            <section className="py-12 relative" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href="/compositions">
                        <a className="inline-flex items-center text-purple hover:text-purple-dark mb-6" data-testid="link-back-to-compositions">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Compositions
                        </a>
                    </Link>
                    
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        {/* Title and Year */}
                        <div className="mb-8">
                            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-navy mb-4" data-testid="composition-title">
                                {composition.title}
                            </h1>
                            {composition.year && (
                                <div className="flex items-center text-xl text-gray-600">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    <span data-testid="composition-year">{composition.year}</span>
                                </div>
                            )}
                        </div>

                        {/* Category Badge */}
                        {composition.category && (
                            <div className="mb-6">
                                <span className={`inline-block text-white text-sm px-4 py-2 rounded-full font-medium ${
                                    composition.ensemble.includes('String Quartet') ? 'bg-purple' :
                                    composition.ensemble.includes('Orchestra') ? 'bg-gold' :
                                    composition.ensemble.includes('Piano Solo') ? 'bg-blue-500' :
                                    composition.ensemble.includes('Choral') ? 'bg-green-500' :
                                    composition.ensemble.includes('Solos') ? 'bg-red-500' :
                                    'bg-gray-500'
                                }`} data-testid="composition-category">
                                    {composition.category}
                                </span>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Instrumentation */}
                                {composition.instrumentation && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-navy mb-2 flex items-center">
                                            <Music className="h-5 w-5 mr-2" />
                                            Instrumentation
                                        </h2>
                                        <p className="text-gray-700" data-testid="composition-instrumentation">
                                            {composition.instrumentation}
                                        </p>
                                    </div>
                                )}

                                {/* Ensemble */}
                                {composition.ensemble && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-navy mb-2 flex items-center">
                                            <Users className="h-5 w-5 mr-2" />
                                            Ensemble Type
                                        </h2>
                                        <p className="text-gray-700" data-testid="composition-ensemble">
                                            {composition.ensemble}
                                        </p>
                                    </div>
                                )}

                                {/* Duration */}
                                {composition.duration && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-navy mb-2 flex items-center">
                                            <Clock className="h-5 w-5 mr-2" />
                                            Duration
                                        </h2>
                                        <p className="text-gray-700" data-testid="composition-duration">
                                            {composition.duration}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Premiere Information */}
                                {composition.premiere_info && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-navy mb-2">
                                            Premiere Information
                                        </h2>
                                        <p className="text-gray-700" data-testid="composition-premiere">
                                            {composition.premiere_info}
                                        </p>
                                    </div>
                                )}

                                {/* Publisher */}
                                {composition.publisher && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-navy mb-2">
                                            Publisher
                                        </h2>
                                        <p className="text-gray-700" data-testid="composition-publisher">
                                            {composition.publisher}
                                        </p>
                                    </div>
                                )}

                                {/* Recording */}
                                {composition.recording && (
                                    <div>
                                        <h2 className="text-lg font-semibold text-navy mb-2">
                                            Recording
                                        </h2>
                                        {composition.recording.includes('http') ? (
                                            <a 
                                                href={composition.recording} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-purple hover:underline flex items-center"
                                                data-testid="composition-recording-link"
                                            >
                                                Listen to Recording
                                                <ExternalLink className="h-4 w-4 ml-2" />
                                            </a>
                                        ) : (
                                            <p className="text-gray-700" data-testid="composition-recording">
                                                {composition.recording}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}