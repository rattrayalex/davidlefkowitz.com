import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Recording } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

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
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="recordings-title">
                            Recordings
                        </h1>
                    </div>
                </div>
            </section>

            {/* Instruction Text */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-gray-600 text-left mb-10 italic">
                    (Click on album image for more information.)
                </p>
            </div>

            {/* Recordings Grid */}
            <section className="pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {recordings.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg" data-testid="no-recordings">
                                No recordings available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {recordings.map((recording) => (
                                <div 
                                    key={recording.id}
                                    className="border border-purple rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300" style={{backgroundColor: '#e5e5ff'}}
                                    data-testid={`recording-${recording.id}`}
                                >
                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Title */}
                                        <h3 className="text-xl font-playfair font-semibold text-navy mb-4 text-center" data-testid={`recording-title-${recording.id}`}>
                                            {recording.title}
                                        </h3>

                                        {/* Album Cover */}
                                        {recording.album_cover && (
                                            <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden mb-4 rounded-lg">
                                                <img 
                                                    src={recording.album_cover}
                                                    alt={recording.title}
                                                    className="w-full h-full object-cover"
                                                    data-testid={`recording-cover-${recording.id}`}
                                                />
                                            </div>
                                        )}

                                        {/* Label */}
                                        {recording.label && (
                                            recording.label_url ? (
                                                <a 
                                                    href={recording.label_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple hover:text-purple-700 text-center block underline transition-colors duration-200"
                                                    data-testid={`recording-label-${recording.id}`}
                                                >
                                                    {recording.label}
                                                </a>
                                            ) : (
                                                <p className="text-gray-700 text-center" data-testid={`recording-label-${recording.id}`}>
                                                    {recording.label}
                                                </p>
                                            )
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
