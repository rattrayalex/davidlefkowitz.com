import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, ExternalLink, Calendar, Clock } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Recording } from "@shared/schema";

export default function Recordings() {
    const { data: recordings = [], isLoading } = useQuery<Recording[]>({
        queryKey: ["/api/recordings"],
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
            <section className="py-20" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="recordings-title">
                            Recordings
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Professional recordings of compositions performed by world-class musicians and ensembles
                        </p>
                    </div>
                </div>
            </section>

            {/* Recordings Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {recordings.length === 0 ? (
                        <div className="text-center py-12">
                            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg" data-testid="no-recordings">
                                No recordings available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recordings.map((recording) => (
                                <div 
                                    key={recording.id}
                                    className="border border-gray-300 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300" style={{backgroundColor: '#e5e5ff'}}
                                    data-testid={`recording-${recording.id}`}
                                >
                                    {/* Album Cover */}
                                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                                        {recording.album_cover ? (
                                            <img 
                                                src={recording.album_cover}
                                                alt={recording.title}
                                                className="w-full h-full object-cover"
                                                data-testid={`recording-cover-${recording.id}`}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Play className="h-16 w-16 text-purple opacity-50" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Title */}
                                        <h3 className="text-xl font-playfair font-semibold text-navy mb-2" data-testid={`recording-title-${recording.id}`}>
                                            {recording.title}
                                        </h3>

                                        {/* Performer */}
                                        <p className="text-purple font-medium mb-3" data-testid={`recording-performer-${recording.id}`}>
                                            {recording.performer}
                                        </p>

                                        {/* Release Date and Duration */}
                                        <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                                            {recording.release_date && (
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    <span data-testid={`recording-date-${recording.id}`}>
                                                        {new Date(recording.release_date).getFullYear()}
                                                    </span>
                                                </div>
                                            )}
                                            {recording.duration && (
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    <span data-testid={`recording-duration-${recording.id}`}>
                                                        {recording.duration}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-700 text-sm leading-relaxed mb-4" data-testid={`recording-description-${recording.id}`}>
                                            {recording.description}
                                        </p>

                                        {/* Links */}
                                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                            {recording.audio_url && (
                                                <a
                                                    href={recording.audio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-purple hover:text-purple-700 text-sm font-medium transition-colors duration-200"
                                                    data-testid={`recording-audio-link-${recording.id}`}
                                                >
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Listen
                                                </a>
                                            )}
                                            {recording.video_url && (
                                                <a
                                                    href={recording.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-purple hover:text-purple-700 text-sm font-medium transition-colors duration-200"
                                                    data-testid={`recording-video-link-${recording.id}`}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    Watch
                                                </a>
                                            )}
                                        </div>
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
