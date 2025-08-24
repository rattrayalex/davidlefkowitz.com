import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Music, Calendar } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Composition } from "@shared/schema";

export default function Compositions() {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    
    const { data: compositions = [], isLoading } = useQuery<Composition[]>({
        queryKey: ["/api/compositions"],
    });

    const categories = ["All", ...Array.from(new Set(compositions.map(c => c.category)))];
    
    const filteredCompositions = selectedCategory === "All" 
        ? compositions 
        : compositions.filter(c => c.category === selectedCategory);

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
            <section className="py-20" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="compositions-title">
                            Compositions
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            A comprehensive catalog of works spanning multiple genres and instrumental combinations
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 border-b border-gray-300" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-4 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                                    selectedCategory === category
                                        ? "bg-purple text-white shadow-lg"
                                        : "border border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                                data-testid={`filter-${category.toLowerCase().replace(' ', '-')}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compositions Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredCompositions.length === 0 ? (
                        <div className="text-center py-12">
                            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg" data-testid="no-compositions">
                                No compositions available in this category.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCompositions.map((composition) => (
                                <div 
                                    key={composition.id}
                                    className="border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300" style={{backgroundColor: '#e5e5ff'}}
                                    data-testid={`composition-${composition.id}`}
                                >
                                    {/* Category Badge */}
                                    <div className="mb-4">
                                        <span className={`inline-block text-white text-sm px-3 py-1 rounded-full font-medium ${
                                            composition.category === 'Chamber Music' ? 'bg-purple' :
                                            composition.category === 'Orchestral' ? 'bg-gold' :
                                            composition.category === 'Solo' ? 'bg-blue-500' :
                                            composition.category === 'Electronic' ? 'bg-green-500' :
                                            composition.category === 'Vocal' ? 'bg-red-500' :
                                            'bg-gray-500'
                                        }`} data-testid={`composition-category-${composition.id}`}>
                                            {composition.category}
                                        </span>
                                    </div>

                                    {/* Title and Year */}
                                    <div className="mb-4">
                                        <h3 className="text-xl font-playfair font-semibold text-navy mb-2" data-testid={`composition-title-${composition.id}`}>
                                            {composition.title}
                                        </h3>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            <span data-testid={`composition-year-${composition.id}`}>{composition.year}</span>
                                        </div>
                                    </div>

                                    {/* Instrumentation */}
                                    <p className="text-purple font-medium mb-3" data-testid={`composition-instrumentation-${composition.id}`}>
                                        {composition.instrumentation}
                                    </p>

                                    {/* Duration */}
                                    {composition.duration && (
                                        <p className="text-gray-600 text-sm mb-3" data-testid={`composition-duration-${composition.id}`}>
                                            Duration: {composition.duration}
                                        </p>
                                    )}

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm leading-relaxed mb-4" data-testid={`composition-description-${composition.id}`}>
                                        {composition.description}
                                    </p>

                                    {/* Premiere Info */}
                                    {composition.premiere_info && (
                                        <div className="mb-4 p-3 border border-gray-300 rounded-lg" style={{backgroundColor: '#e5e5ff'}}>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                                Premiere
                                            </p>
                                            <p className="text-sm text-gray-700" data-testid={`composition-premiere-${composition.id}`}>
                                                {composition.premiere_info}
                                            </p>
                                        </div>
                                    )}

                                    {/* Links */}
                                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                        {composition.score_url && (
                                            <a
                                                href={composition.score_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-purple hover:text-purple-700 text-sm font-medium transition-colors duration-200"
                                                data-testid={`composition-score-link-${composition.id}`}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                Score
                                            </a>
                                        )}
                                        {composition.audio_url && (
                                            <a
                                                href={composition.audio_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-purple hover:text-purple-700 text-sm font-medium transition-colors duration-200"
                                                data-testid={`composition-audio-link-${composition.id}`}
                                            >
                                                <Music className="h-4 w-4 mr-1" />
                                                Audio
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
